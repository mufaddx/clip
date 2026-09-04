import { Worker, type Job } from "bullmq";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES } from "./queues";
import type { ReelsService } from "../modules/reels/reels.service";

/**
 * Reel Verification Worker — runs the real check enqueued by
 * ReelsService.createReel() (both submission paths): a live Graph API
 * ownership lookup plus a content-hash comparison against the campaign's
 * creative. See ReelsService.processVerification() for what "real" means
 * here — this worker is just the queue plumbing around it.
 */
export function startReelVerificationWorker(reelsService: ReelsService): Worker<{ reelId: string }> {
  return new Worker(
    QUEUE_NAMES.reelVerification,
    async (job: Job<{ reelId: string }>) => {
      return reelsService.processVerification(job.data.reelId);
    },
    { connection: createRedisConnection() }
  );
}
