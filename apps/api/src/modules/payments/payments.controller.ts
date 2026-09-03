import { BadRequestException, Body, Controller, Headers, Post, Req } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { getEnv } from "@clip/config";
import { prisma } from "@clip/db";
import { Public } from "../../common/decorators/public.decorator";
import { WalletService } from "../wallet/wallet.service";

/** Razorpay's actual webhook envelope — see https://razorpay.com/docs/webhooks/payloads/. */
interface RazorpayWebhookBody {
  event: string;
  payload: {
    payment?: { entity: { id: string; amount: number; notes?: { userId?: string } } };
    payout?: { entity: { id: string; reference_id?: string; failure_reason?: string } };
    refund?: { entity: { id: string } };
  };
}

@Controller("v1/payments")
export class PaymentsController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Verified via X-Razorpay-Signature (HMAC-SHA256 hex over the raw body,
   * using PAYMENT_WEBHOOK_SECRET — Razorpay's own scheme) before the
   * payload is trusted, per docs/architecture/SECURITY_ARCHITECTURE.md
   * "Webhook security". See docs/api/WEBHOOKS.md "Payment provider webhooks".
   */
  @Public()
  @Post("webhook")
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers("x-razorpay-signature") signature: string, @Body() body: RazorpayWebhookBody) {
    this.verifySignature(req.rawBody, signature);

    switch (body.event) {
      case "payment.captured": {
        const payment = body.payload.payment?.entity;
        const userId = payment?.notes?.userId;
        if (!payment || !userId) {
          throw new BadRequestException({ code: "INVALID_PAYLOAD", message: "Missing payment entity or notes.userId." });
        }
        // recognizeDeposit's own idempotencyKey (`deposit:<providerReference>`)
        // makes a redelivered webhook a no-op at the ledger-write level; a
        // duplicate insert throws on WalletLedgerEntry's unique constraint
        // rather than silently double-crediting — see docs/finance/LEDGER_ARCHITECTURE.md.
        await prisma.payment.updateMany({ where: { providerReference: payment.id }, data: { status: "SUCCEEDED" } });
        await this.walletService.recognizeDeposit(userId, payment.amount, payment.id).catch((err) => {
          if (!isUniqueConstraintError(err)) throw err;
        });
        break;
      }

      case "payout.processed": {
        const payout = body.payload.payout?.entity;
        if (!payout?.reference_id) throw new BadRequestException({ code: "INVALID_PAYLOAD", message: "Missing payout reference_id." });
        await this.walletService.completeWithdrawal(payout.reference_id).catch((err) => {
          if (!isUniqueConstraintError(err)) throw err;
        });
        break;
      }

      case "payout.failed":
      case "payout.reversed": {
        const payout = body.payload.payout?.entity;
        if (!payout?.reference_id) throw new BadRequestException({ code: "INVALID_PAYLOAD", message: "Missing payout reference_id." });
        await this.walletService.failWithdrawal(payout.reference_id, payout.failure_reason ?? "Razorpay reported failure.");
        break;
      }

      case "refund.processed":
        // Refund confirmation is currently logged only — refundToPaymentMethod
        // already records the platform-side ledger entry at request time;
        // this would update the matching `payments` row's status.
        if (body.payload.refund?.entity.id) {
          await prisma.payment.updateMany({ where: { providerReference: body.payload.refund.entity.id }, data: { status: "SUCCEEDED" } });
        }
        break;
    }

    return { received: true };
  }

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

/** Prisma's unique-constraint violation code — thrown by a redelivered webhook hitting an idempotencyKey that already exists. */
function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002";
}
