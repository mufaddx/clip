import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { prisma } from "@clip/db";
import { getEnv } from "@clip/config";
import { WalletService } from "../wallet/wallet.service";

/**
 * Payment provider adapter — see docs/finance/PAYMENT_SYSTEM.md "Provider
 * abstraction". This is the ONLY module allowed to call a payment
 * provider's API; nothing else in the codebase does.
 *
 * No specific provider (Razorpay/Stripe/etc.) has been chosen yet, so the
 * provider-specific request shapes below are intentionally not implemented
 * — calling them throws a clear 503 rather than pretending to work. What
 * IS real and complete: the `payments` bookkeeping, and the webhook
 * signature verification + event dispatch in PaymentsWebhookController,
 * since that shape is provider-agnostic (see docs/api/WEBHOOKS.md).
 */
@Injectable()
export class PaymentsService {
  constructor(private readonly walletService: WalletService) {}

  private requireProviderConfig() {
    const env = getEnv();
    if (!env.PAYMENT_PROVIDER_KEY || !env.PAYMENT_PROVIDER_SECRET) {
      throw new ServiceUnavailableException({
        code: "PAYMENTS_NOT_CONFIGURED",
        message: "No payment provider is configured yet (PAYMENT_PROVIDER_KEY/PAYMENT_PROVIDER_SECRET).",
      });
    }
    return env;
  }

  /**
   * Creates a `payments` row and would call the provider's create-intent
   * API — see docs/finance/PAYMENT_SYSTEM.md "Deposit flow". The actual
   * provider call is a TODO: fill in the real endpoint/request shape once
   * a provider is chosen.
   */
  async createDepositIntent(userId: string, amountMinor: number) {
    this.requireProviderConfig();
    const wallet = await this.walletService.getWalletByUserId(userId);

    const providerReference = `pending-${crypto.randomUUID()}`;
    const payment = await prisma.payment.create({
      data: { purpose: "DEPOSIT", providerReference, amount: amountMinor, currency: wallet.currency, status: "PENDING" },
    });

    // TODO(provider): call the chosen provider's "create payment intent"
    // API here and return whatever client-side token/secret it expects the
    // frontend to complete the charge with.
    throw new ServiceUnavailableException({
      code: "PAYMENTS_NOT_CONFIGURED",
      message: `Payment row ${payment.id} created, but no provider integration exists yet to actually collect payment.`,
    });
  }

  /** See docs/finance/WITHDRAWAL_SYSTEM.md — called after WalletService.requestWithdrawal creates the PROCESSING debit. */
  async createPayout(withdrawalId: string) {
    this.requireProviderConfig();
    // TODO(provider): call the chosen provider's payout/transfer API,
    // storing the reference on a `payments` row (purpose: PAYOUT). On the
    // provider's later webhook confirmation, PaymentsWebhookController
    // calls walletService.completeWithdrawal/failWithdrawal.
    throw new ServiceUnavailableException({
      code: "PAYMENTS_NOT_CONFIGURED",
      message: `No provider integration exists yet to actually pay out withdrawal ${withdrawalId}.`,
    });
  }
}
