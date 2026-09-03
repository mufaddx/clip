import { Worker } from "bullmq";
import { prisma } from "@clip/db";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES } from "./queues";

/**
 * Referral Reward Worker — see docs/architecture/BACKGROUND_JOBS.md and
 * docs/referrals/REFERRAL_RULES.md "Expiration". Synchronous eligibility
 * evaluation already happens inline (UsersController → ReferralsService on
 * onboarding completion); this worker's job is the proactive sweep that
 * doesn't wait for a user action — expiring stale PENDING referrals.
 */
export function startReferralRewardWorker(): Worker<Record<string, never>> {
  return new Worker(
    QUEUE_NAMES.referralRewards,
    async () => {
      const rule = await prisma.systemSetting.findUnique({ where: { key: "referral_rules" } });
      const expirationDays = (rule?.value as { expirationDays?: number } | undefined)?.expirationDays ?? 90;
      const cutoff = new Date(Date.now() - expirationDays * 24 * 60 * 60 * 1000);

      const { count } = await prisma.referral.updateMany({
        where: { status: "PENDING", createdAt: { lt: cutoff } },
        data: { status: "EXPIRED" },
      });
      return { expired: count };
    },
    { connection: createRedisConnection() }
  );
}
