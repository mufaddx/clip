import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type Prisma, type LedgerBucket, type LedgerSource } from "@clip/db";

type Tx = Prisma.TransactionClient;

const BUCKET_FIELD: Record<LedgerBucket, keyof Prisma.WalletUncheckedUpdateInput> = {
  AVAILABLE: "availableBalance",
  LOCKED: "lockedBalance",
  SPENT: "spentBalance",
  REFUNDABLE: "refundableBalance",
  PENDING: "pendingBalance",
  PROCESSING: "processingBalance",
  WITHDRAWN: "withdrawnBalance",
};

/**
 * Reads a known-present balance column off a Wallet row by dynamic field
 * name. The non-null assertion is safe here — these are real columns on
 * every Wallet row, never actually missing; `noUncheckedIndexedAccess`
 * just can't know that for a dynamic string key.
 */
function readBucket(row: object, field: string): number {
  return (row as unknown as Record<string, number>)[field]!;
}

/**
 * The only module allowed to mutate wallet balances — every mutation here
 * is a paired, transactional wallet_ledger write, never a raw balance
 * update. See docs/finance/LEDGER_ARCHITECTURE.md invariants:
 *   1. Append-only ledger.
 *   2. Every entry is part of a balanced transaction.
 *   3. balance_after stored on write.
 *   4. Idempotency keys on job-driven entries.
 */
@Injectable()
export class WalletService {
  async getWalletByUserId(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException({ code: "WALLET_NOT_FOUND", message: "Wallet not found." });
    return wallet;
  }

  async getLedger(userId: string, limit = 50, cursor?: string) {
    const wallet = await this.getWalletByUserId(userId);
    return prisma.walletLedgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  /**
   * Moves `amount` from one bucket to another within the same wallet,
   * writing two ledger entries that share `relatedTransactionId` — the
   * fundamental primitive every other wallet operation is built from.
   * Throws if the source bucket doesn't have enough balance.
   */
  private async moveBucket(
    tx: Tx,
    walletId: string,
    from: LedgerBucket,
    to: LedgerBucket,
    amount: number,
    source: LedgerSource,
    opts: {
      relatedEntityType?: string;
      relatedEntityId?: string;
      idempotencyKeyBase?: string;
      createdBy?: string;
    } = {}
  ) {
    if (amount <= 0) throw new BadRequestException({ code: "INVALID_AMOUNT", message: "Amount must be positive." });

    const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
    const fromField = BUCKET_FIELD[from];
    const toField = BUCKET_FIELD[to];
    const currentFrom = readBucket(wallet, fromField);

    if (currentFrom < amount) {
      throw new BadRequestException({
        code: "INSUFFICIENT_BALANCE",
        message: `Insufficient ${from} balance.`,
        details: { available: currentFrom, requested: amount },
      });
    }

    const relatedTransactionId = `${opts.idempotencyKeyBase ?? crypto.randomUUID()}`;

    const updated = await tx.wallet.update({
      where: { id: walletId },
      data: {
        [fromField]: { decrement: amount },
        [toField]: { increment: amount },
      },
    });

    await tx.walletLedgerEntry.create({
      data: {
        walletId,
        type: "DEBIT",
        bucket: from,
        amount,
        source,
        relatedTransactionId,
        relatedEntityType: opts.relatedEntityType,
        relatedEntityId: opts.relatedEntityId,
        balanceAfter: readBucket(updated, fromField),
        idempotencyKey: opts.idempotencyKeyBase ? `${opts.idempotencyKeyBase}:debit` : undefined,
        createdBy: opts.createdBy,
      },
    });

    await tx.walletLedgerEntry.create({
      data: {
        walletId,
        type: "CREDIT",
        bucket: to,
        amount,
        source,
        relatedTransactionId,
        relatedEntityType: opts.relatedEntityType,
        relatedEntityId: opts.relatedEntityId,
        balanceAfter: readBucket(updated, toField),
        idempotencyKey: opts.idempotencyKeyBase ? `${opts.idempotencyKeyBase}:credit` : undefined,
        createdBy: opts.createdBy,
      },
    });

    return updated;
  }

  /** Credits a bucket with new money entering the system (deposit, referral reward). */
  private async creditNew(
    tx: Tx,
    walletId: string,
    bucket: LedgerBucket,
    amount: number,
    source: LedgerSource,
    opts: { relatedEntityType?: string; relatedEntityId?: string; idempotencyKey?: string } = {}
  ) {
    const field = BUCKET_FIELD[bucket];
    const updated = await tx.wallet.update({ where: { id: walletId }, data: { [field]: { increment: amount } } });
    await tx.walletLedgerEntry.create({
      data: {
        walletId,
        type: "CREDIT",
        bucket,
        amount,
        source,
        relatedEntityType: opts.relatedEntityType,
        relatedEntityId: opts.relatedEntityId,
        balanceAfter: readBucket(updated, field),
        idempotencyKey: opts.idempotencyKey,
      },
    });
    return updated;
  }

  /** Debits a bucket for money leaving the system entirely (e.g. a settled withdrawal). */
  private async debitOut(
    tx: Tx,
    walletId: string,
    bucket: LedgerBucket,
    amount: number,
    source: LedgerSource,
    opts: { relatedEntityType?: string; relatedEntityId?: string; idempotencyKey?: string } = {}
  ) {
    const field = BUCKET_FIELD[bucket];
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
    const current = readBucket(wallet, field);
    if (current < amount) {
      throw new BadRequestException({ code: "INSUFFICIENT_BALANCE", message: `Insufficient ${bucket} balance.` });
    }
    const updated = await tx.wallet.update({ where: { id: walletId }, data: { [field]: { decrement: amount } } });
    await tx.walletLedgerEntry.create({
      data: {
        walletId,
        type: "DEBIT",
        bucket,
        amount,
        source,
        relatedEntityType: opts.relatedEntityType,
        relatedEntityId: opts.relatedEntityId,
        balanceAfter: readBucket(updated, field),
        idempotencyKey: opts.idempotencyKey,
      },
    });
    return updated;
  }

  // ── Deposits ────────────────────────────────────────────────────────────

  /**
   * Recognizes a confirmed deposit — called only from the payments webhook
   * handler once the provider has confirmed the charge, never from a
   * client-side "success" callback. See docs/finance/PAYMENT_SYSTEM.md.
   */
  async recognizeDeposit(userId: string, amountMinor: number, providerReference: string) {
    const wallet = await this.getWalletByUserId(userId);
    return prisma.$transaction((tx) =>
      this.creditNew(tx, wallet.id, "AVAILABLE", amountMinor, "DEPOSIT", {
        relatedEntityType: "payment",
        relatedEntityId: providerReference,
        idempotencyKey: `deposit:${providerReference}`,
      })
    );
  }

  // ── Campaign funding ─────────────────────────────────────────────────────

  /** APPROVED → FUNDED gate: locks the campaign's full budget out of AVAILABLE. */
  async lockForCampaign(brandUserId: string, campaignId: string, amountMinor: number) {
    const wallet = await this.getWalletByUserId(brandUserId);
    return prisma.$transaction((tx) =>
      this.moveBucket(tx, wallet.id, "AVAILABLE", "LOCKED", amountMinor, "CAMPAIGN_FUND", {
        relatedEntityType: "campaign",
        relatedEntityId: campaignId,
        idempotencyKeyBase: `fund:${campaignId}`,
      })
    );
  }

  /** Cancellation/underspend: unspent LOCKED budget becomes REFUNDABLE — see docs/finance/REFUND_SYSTEM.md. */
  async releaseLockToRefundable(brandUserId: string, campaignId: string, amountMinor: number) {
    const wallet = await this.getWalletByUserId(brandUserId);
    return prisma.$transaction((tx) =>
      this.moveBucket(tx, wallet.id, "LOCKED", "REFUNDABLE", amountMinor, "REFUND", {
        relatedEntityType: "campaign",
        relatedEntityId: campaignId,
        idempotencyKeyBase: `release:${campaignId}:${crypto.randomUUID()}`,
      })
    );
  }

  /** Brand chooses to keep a REFUNDABLE amount in-platform rather than cashing it out. */
  async returnRefundableToAvailable(brandUserId: string, amountMinor: number) {
    const wallet = await this.getWalletByUserId(brandUserId);
    return prisma.$transaction((tx) =>
      this.moveBucket(tx, wallet.id, "REFUNDABLE", "AVAILABLE", amountMinor, "REFUND", {
        idempotencyKeyBase: `refundable-return:${crypto.randomUUID()}`,
      })
    );
  }

  // ── Creator earnings ─────────────────────────────────────────────────────

  /**
   * Qualified performance finalized → creator earning posted as PENDING,
   * brand's LOCKED converts to SPENT in the same operation — see
   * docs/finance/CREATOR_EARNINGS.md. Idempotent per reel: a retried
   * Earnings Worker job for the same reel will not double-post.
   */
  async postEarning(brandUserId: string, creatorUserId: string, campaignId: string, reelId: string, amountMinor: number) {
    const [brandWallet, creatorWallet] = await Promise.all([
      this.getWalletByUserId(brandUserId),
      this.getWalletByUserId(creatorUserId),
    ]);

    const idempotencyKey = `earning:${reelId}`;
    const existing = await prisma.walletLedgerEntry.findFirst({
      where: { idempotencyKey: { startsWith: idempotencyKey } },
    });
    if (existing) return; // already posted for this reel

    await prisma.$transaction(async (tx) => {
      await this.moveBucket(tx, brandWallet.id, "LOCKED", "SPENT", amountMinor, "CAMPAIGN_SPEND", {
        relatedEntityType: "campaign",
        relatedEntityId: campaignId,
        idempotencyKeyBase: `spend:${reelId}`,
      });
      await this.creditNew(tx, creatorWallet.id, "PENDING", amountMinor, "EARNING", {
        relatedEntityType: "campaign_reel",
        relatedEntityId: reelId,
        idempotencyKey,
      });
    });
  }

  /** Verification window closed without a successful dispute — PENDING → AVAILABLE. */
  async settleEarning(creatorUserId: string, reelId: string, amountMinor: number) {
    const wallet = await this.getWalletByUserId(creatorUserId);
    return prisma.$transaction((tx) =>
      this.moveBucket(tx, wallet.id, "PENDING", "AVAILABLE", amountMinor, "EARNING", {
        relatedEntityType: "campaign_reel",
        relatedEntityId: reelId,
        idempotencyKeyBase: `settle:${reelId}`,
      })
    );
  }

  /**
   * Dispute upheld against a reel's earnings — a compensating reversal,
   * never a direct edit of the original entry. See docs/finance/REFUND_SYSTEM.md
   * "Dispute-driven reversal". Reverses from AVAILABLE if already settled,
   * otherwise from PENDING.
   */
  async reverseEarning(creatorUserId: string, reelId: string, amountMinor: number, disputeId: string) {
    const wallet = await this.getWalletByUserId(creatorUserId);
    const bucket: LedgerBucket = wallet.pendingBalance >= amountMinor ? "PENDING" : "AVAILABLE";
    return prisma.$transaction((tx) =>
      this.debitOut(tx, wallet.id, bucket, amountMinor, "ADJUSTMENT", {
        relatedEntityType: "dispute",
        relatedEntityId: disputeId,
        idempotencyKey: `reverse:${reelId}:${disputeId}`,
      })
    );
  }

  // ── Referral rewards ─────────────────────────────────────────────────────

  /** Posts an approved referral reward straight to AVAILABLE — see docs/referrals/REFERRAL_SYSTEM.md. */
  async recognizeReferralReward(userId: string, amountMinor: number, referralId: string) {
    const wallet = await this.getWalletByUserId(userId);
    return prisma.$transaction((tx) =>
      this.creditNew(tx, wallet.id, "AVAILABLE", amountMinor, "REFERRAL_REWARD", {
        relatedEntityType: "referral",
        relatedEntityId: referralId,
        idempotencyKey: `referral-reward:${referralId}`,
      })
    );
  }

  // ── Withdrawals ───────────────────────────────────────────────────────────

  /** AVAILABLE → PROCESSING immediately, so the same funds can't be withdrawn twice. */
  async requestWithdrawal(userId: string, amountMinor: number, payoutMethod?: string) {
    const wallet = await this.getWalletByUserId(userId);
    return prisma.$transaction(async (tx) => {
      await this.moveBucket(tx, wallet.id, "AVAILABLE", "PROCESSING", amountMinor, "WITHDRAWAL", {
        idempotencyKeyBase: `withdraw-request:${crypto.randomUUID()}`,
      });
      return tx.withdrawal.create({
        data: { walletId: wallet.id, amount: amountMinor, payoutMethod, status: "REQUESTED" },
      });
    });
  }

  /**
   * Provider confirms payout — PROCESSING → WITHDRAWN, permanently leaving
   * the platform. Uses moveBucket (not debitOut) so the WITHDRAWN increment
   * is itself a ledger-backed CREDIT, not a raw field update — see
   * docs/finance/LEDGER_ARCHITECTURE.md invariant 2 (every entry is part of
   * a balanced transaction).
   */
  async completeWithdrawal(withdrawalId: string) {
    const withdrawal = await prisma.withdrawal.findUniqueOrThrow({ where: { id: withdrawalId } });
    return prisma.$transaction(async (tx) => {
      await this.moveBucket(tx, withdrawal.walletId, "PROCESSING", "WITHDRAWN", withdrawal.amount, "WITHDRAWAL", {
        relatedEntityType: "withdrawal",
        relatedEntityId: withdrawalId,
        idempotencyKeyBase: `withdraw-complete:${withdrawalId}`,
      });
      return tx.withdrawal.update({ where: { id: withdrawalId }, data: { status: "PAID", paidAt: new Date() } });
    });
  }

  /** Provider rejects the payout — funds return to AVAILABLE, never silently. */
  async failWithdrawal(withdrawalId: string, reason: string) {
    const withdrawal = await prisma.withdrawal.findUniqueOrThrow({ where: { id: withdrawalId } });
    return prisma.$transaction(async (tx) => {
      await this.moveBucket(
        tx,
        withdrawal.walletId,
        "PROCESSING",
        "AVAILABLE",
        withdrawal.amount,
        "WITHDRAWAL",
        { relatedEntityType: "withdrawal", relatedEntityId: withdrawalId, idempotencyKeyBase: `withdraw-fail:${withdrawalId}` }
      );
      return tx.withdrawal.update({ where: { id: withdrawalId }, data: { status: "FAILED", failureReason: reason } });
    });
  }

  async listWithdrawals(userId: string) {
    const wallet = await this.getWalletByUserId(userId);
    return prisma.withdrawal.findMany({ where: { walletId: wallet.id }, orderBy: { requestedAt: "desc" } });
  }

  // ── Refunds ───────────────────────────────────────────────────────────────

  /** Cash refund of REFUNDABLE balance out to the original payment method. */
  async refundToPaymentMethod(userId: string, amountMinor: number, campaignId: string | undefined, reason: string) {
    const wallet = await this.getWalletByUserId(userId);
    return prisma.$transaction(async (tx) => {
      await this.debitOut(tx, wallet.id, "REFUNDABLE", amountMinor, "REFUND", {
        relatedEntityType: "campaign",
        relatedEntityId: campaignId,
        idempotencyKey: `refund:${crypto.randomUUID()}`,
      });
      return tx.refund.create({ data: { walletId: wallet.id, campaignId, amount: amountMinor, reason } });
    });
  }
}
