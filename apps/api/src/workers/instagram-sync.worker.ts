import { Worker } from "bullmq";
import { prisma } from "@clip/db";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES, instagramSyncQueue } from "./queues";
import type { InstagramService } from "../modules/instagram/instagram.service";

/**
 * Instagram Sync Worker — refreshes tokens before they expire and updates
 * connection health. See docs/architecture/BACKGROUND_JOBS.md and
 * docs/architecture/META_INSTAGRAM_INTEGRATION.md "Token monitoring".
 * Enqueued on a repeatable schedule by scheduleInstagramSync() below, one
 * job per account rather than one giant job, so accounts are staggered
 * against Meta's rate limit — see META_INSTAGRAM_INTEGRATION.md "Rate limits".
 */
export function startInstagramSyncWorker(instagramService: InstagramService): Worker<{ instagramAccountId: string }> {
  return new Worker<{ instagramAccountId: string }>(
    QUEUE_NAMES.instagramSync,
    async (job) => {
      await instagramService.refreshAccountToken(job.data.instagramAccountId);
    },
    { connection: createRedisConnection() }
  );
}

/** Finds accounts expiring within 3 days and enqueues one refresh job per account. */
export async function enqueueExpiringAccountRefreshes(): Promise<number> {
  const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const accounts = await prisma.instagramAccount.findMany({
    where: { disconnectedAt: null, token: { expiresAt: { lt: soon } } },
    select: { id: true },
  });

  for (const account of accounts) {
    await instagramSyncQueue.add("refresh-token", { instagramAccountId: account.id }, { jobId: `refresh:${account.id}:${Date.now()}` });
  }

  return accounts.length;
}
