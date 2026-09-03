import { BadRequestException, Body, Controller, Headers, Post, Req } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { getEnv } from "@clip/config";
import { prisma } from "@clip/db";
import { Public } from "../../common/decorators/public.decorator";
import { WalletService } from "../wallet/wallet.service";

/**
 * Normalized webhook event shape this handler dispatches on. Mapping the
 * real provider's payload into this shape is provider-specific glue —
 * see PaymentsService's TODOs — but verification + dispatch here is real
 * and complete. See docs/api/WEBHOOKS.md "Payment provider webhooks".
 */
interface NormalizedPaymentEvent {
  id: string; // provider event id — used for idempotent dedup
  type: "deposit.succeeded" | "payout.succeeded" | "payout.failed" | "refund.succeeded";
  data: { userId?: string; amount?: number; providerReference: string; withdrawalId?: string; failureReason?: string };
}

@Controller("v1/payments")
export class PaymentsController {
  constructor(private readonly walletService: WalletService) {}

  @Public()
  @Post("webhook")
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers("x-webhook-signature") signature: string, @Body() body: NormalizedPaymentEvent) {
    this.verifySignature(req.rawBody, signature);

    // Idempotent by provider event id — a redelivered webhook must not
    // double-process. See docs/api/WEBHOOKS.md "General webhook rules".
    const alreadyProcessed = await prisma.walletLedgerEntry.findFirst({
      where: { idempotencyKey: { contains: body.id } },
    });
    if (alreadyProcessed) return { received: true, duplicate: true };

    switch (body.type) {
      case "deposit.succeeded":
        if (!body.data.userId || !body.data.amount) throw new BadRequestException({ code: "INVALID_PAYLOAD", message: "Missing deposit fields." });
        await this.walletService.recognizeDeposit(body.data.userId, body.data.amount, body.data.providerReference);
        break;
      case "payout.succeeded":
        if (!body.data.withdrawalId) throw new BadRequestException({ code: "INVALID_PAYLOAD", message: "Missing withdrawalId." });
        await this.walletService.completeWithdrawal(body.data.withdrawalId);
        break;
      case "payout.failed":
        if (!body.data.withdrawalId) throw new BadRequestException({ code: "INVALID_PAYLOAD", message: "Missing withdrawalId." });
        await this.walletService.failWithdrawal(body.data.withdrawalId, body.data.failureReason ?? "Provider reported failure.");
        break;
      case "refund.succeeded":
        // Refund confirmation is currently logged only — refundToPaymentMethod
        // already records the platform-side ledger entry at request time;
        // provider-side confirmation would update a `payments` row's status.
        break;
    }

    return { received: true };
  }

  /**
   * HMAC-SHA256 over the raw request body — verified BEFORE the payload is
   * trusted, per docs/architecture/SECURITY_ARCHITECTURE.md "Webhook
   * security". The exact header name is provider-specific; adjust once a
   * provider is chosen (this assumes a generic `X-Webhook-Signature: <hex>`).
   */
  private verifySignature(rawBody: Buffer | undefined, signature: string | undefined) {
    const env = getEnv();
    if (!env.PAYMENT_WEBHOOK_SECRET) {
      throw new BadRequestException({ code: "WEBHOOKS_NOT_CONFIGURED", message: "PAYMENT_WEBHOOK_SECRET isn't set." });
    }
    if (!rawBody || !signature) {
      throw new BadRequestException({ code: "INVALID_SIGNATURE", message: "Missing signature or body." });
    }

    const expected = createHmac("sha256", env.PAYMENT_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const actualBuf = Buffer.from(signature, "hex");

    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      throw new BadRequestException({ code: "INVALID_SIGNATURE", message: "Webhook signature verification failed." });
    }
  }
}
