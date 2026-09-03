import { Worker } from "bullmq";
import { prisma } from "@clip/db";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES } from "./queues";
import type { WalletService } from "../modules/wallet/wallet.service";

/**
 * Earnings Worker — moves qualifying performance from PENDING to AVAILABLE
 * once a reel's verification window has closed without a successful
 * dispute. See docs/finance/CREATOR_EARNINGS.md "Why earnings start PENDING".
 *
 * Settlement window is admin-configurable via the
 * `earnings_settlement_window_days` system setting (default 7 days).
 * Tracks "already settled" by checking for a `settle:<reelId>` ledger
 * entry rather than a dedicated column, matching the ledger-is-truth
 * principle in docs/finance/LEDGER_ARCHITECTURE.md.
 */
export function startEarningsWorker(walletService: WalletService): Worker<Record<string, never>> {
  return new Worker(
    QUEUE_NAMES.earnings,
    async () => {
      const setting = await prisma.systemSetting.findUnique({ where: { key: "earnings_settlement_window_days" } });
      const windowDays = typeof setting?.value === "number" ? setting.value : 7;
      const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

      const pendingEarnings = await prisma.walletLedgerEntry.findMany({
        where: {
          source: "EARNING",
          bucket: "PENDING",
          type: "CREDIT",
          relatedEntityType: "campaign_reel",
          createdAt: { lt: cutoff },
        },
      });

      let settled = 0;
      for (const entry of pendingEarnings) {
        const reelId = entry.relatedEntityId;
        if (!reelId) continue;

        const alreadySettled = await prisma.walletLedgerEntry.findFirst({
          where: { idempotencyKey: { startsWith: `settle:${reelId}` } },
        });
        if (alreadySettled) continue;

        const openDispute = await prisma.dispute.findFirst({
          where: { targetType: "campaign_reel", targetId: reelId, status: { notIn: ["RESOLVED", "CLOSED"] } },
        });
        if (openDispute) continue; // held pending resolution — see docs/finance/CREATOR_EARNINGS.md

        const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id: entry.walletId } });
        await walletService.settleEarning(wallet.userId, reelId, entry.amount);
        settled++;
      }

      return { checked: pendingEarnings.length, settled };
    },
    { connection: createRedisConnection() }
  );
}
