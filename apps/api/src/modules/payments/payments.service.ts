import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import Razorpay from "razorpay";
import { prisma } from "@clip/db";
import { getEnv } from "@clip/config";
import { WalletService } from "../wallet/wallet.service";

/**
 * Razorpay adapter — see docs/finance/PAYMENT_SYSTEM.md "Provider
 * abstraction". This is the ONLY module allowed to call Razorpay's API;
 * nothing else in the codebase does.
 */
@Injectable()
export class PaymentsService {
  constructor(private readonly walletService: WalletService) {}

  private getEnvOrThrow() {
    const env = getEnv();
    if (!env.PAYMENT_PROVIDER_KEY || !env.PAYMENT_PROVIDER_SECRET) {
      throw new ServiceUnavailableException({
        code: "PAYMENTS_NOT_CONFIGURED",
        message: "Razorpay isn't configured yet (PAYMENT_PROVIDER_KEY/PAYMENT_PROVIDER_SECRET).",
      });
    }
    return env;
  }

  private getClient(): Razorpay {
    const env = this.getEnvOrThrow();
    return new Razorpay({ key_id: env.PAYMENT_PROVIDER_KEY!, key_secret: env.PAYMENT_PROVIDER_SECRET! });
  }

  /**
   * Creates a Razorpay Order + a `payments` row — see
   * docs/finance/PAYMENT_SYSTEM.md "Deposit flow". The frontend opens
   * Razorpay Checkout with the returned `orderId` + `keyId`; the deposit is
   * only recognized as available balance once the `payment.captured`
   * webhook arrives (see PaymentsController), never on the client-side
   * checkout "success" callback alone.
   */
  async createDepositIntent(userId: string, amountMinor: number) {
    const env = this.getEnvOrThrow();
    const client = this.getClient();
    const wallet = await this.walletService.getWalletByUserId(userId);

    const order = await client.orders.create({
      amount: amountMinor, // Razorpay also expects the smallest currency unit (paise for INR) — matches our minor-unit convention
      currency: wallet.currency,
      receipt: `deposit_${userId}_${Date.now()}`,
      notes: { userId },
    });

    await prisma.payment.create({
      data: {
        purpose: "DEPOSIT",
        providerReference: order.id,
        amount: amountMinor,
        currency: wallet.currency,
        status: "PENDING",
        metadata: order as object,
      },
    });

    return { orderId: order.id, amount: amountMinor, currency: wallet.currency, keyId: env.PAYMENT_PROVIDER_KEY };
  }

  /**
   * RazorpayX Payout — see docs/finance/WITHDRAWAL_SYSTEM.md. Assumes
   * `withdrawal.payoutMethod` holds a Razorpay `fund_account_id` (created
   * via a separate bank-account-linking flow that doesn't exist yet — see
   * docs/README.md implementation status). `RAZORPAY_ACCOUNT_NUMBER` is
   * the platform's own RazorpayX virtual account the payout draws from.
   */
  async createPayout(withdrawalId: string) {
    const env = this.getEnvOrThrow();
    if (!env.RAZORPAY_ACCOUNT_NUMBER) {
      throw new ServiceUnavailableException({
        code: "PAYOUTS_NOT_CONFIGURED",
        message: "RAZORPAY_ACCOUNT_NUMBER isn't set — RazorpayX payouts need the platform's virtual account number.",
      });
    }

    const withdrawal = await prisma.withdrawal.findUniqueOrThrow({ where: { id: withdrawalId } });
    if (!withdrawal.payoutMethod) {
      throw new BadRequestException({
        code: "NO_PAYOUT_METHOD",
        message: "This withdrawal has no linked Razorpay fund_account_id to pay out to.",
      });
    }

    const client = this.getClient();
    // The `payouts` resource isn't in Razorpay's typed SDK surface (RazorpayX
    // is a separate product with its own API base) — calling it through the
    // same client's generic request path.
    const payout = await (client as unknown as { payouts: { create(data: object): Promise<{ id: string; status: string }> } }).payouts.create({
      account_number: env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: withdrawal.payoutMethod,
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: withdrawal.id,
    });

    await prisma.payment.create({
      data: {
        purpose: "PAYOUT",
        providerReference: payout.id,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        status: "PENDING",
        metadata: { withdrawalId, razorpayStatus: payout.status },
      },
    });

    return payout;
  }
}
