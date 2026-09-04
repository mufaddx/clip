import { Queue } from "bullmq";
import { createRedisConnection } from "./connection";

/**
 * Queue name registry — see docs/architecture/BACKGROUND_JOBS.md "Worker
 * registry" for what each queue is for. Reel Verification and Campaign
 * Progress are NOT queues here: verification is a fast, local, synchronous
 * check (folded into ReelsService) with no external call to decouple, and
 * Campaign Progress rollups are computed live by AnalyticsService rather
 * than cached — see docs/architecture/SCALABILITY_ARCHITECTURE.md (adding a
 * cache is "the first thing to revisit" once this stops being fast enough).
 */
export const QUEUE_NAMES = {
  instagramSync: "instagram-sync",
  reelDetection: "reel-detection",
  reelVerification: "reel-verification",
  metricsSync: "metrics-sync",
  earnings: "earnings",
  notifications: "notifications",
  referralRewards: "referral-rewards",
} as const;

const connection = createRedisConnection();

export const instagramSyncQueue = new Queue(QUEUE_NAMES.instagramSync, { connection });
export const reelDetectionQueue = new Queue(QUEUE_NAMES.reelDetection, { connection });
// Verification does a real Graph API ownership check plus a content-hash
// download/compare — genuine external work, so submission enqueues it here
// instead of doing it inline on the request (see reels.service.ts). A reel
// sits at PENDING_VERIFICATION until this queue's worker resolves it.
export const reelVerificationQueue = new Queue(QUEUE_NAMES.reelVerification, { connection });
export const metricsSyncQueue = new Queue(QUEUE_NAMES.metricsSync, { connection });
export const earningsQueue = new Queue(QUEUE_NAMES.earnings, { connection });
export const notificationsQueue = new Queue(QUEUE_NAMES.notifications, { connection });
export const referralRewardsQueue = new Queue(QUEUE_NAMES.referralRewards, { connection });

export interface SendEmailJob {
  userId: string;
  title: string;
  body: string;
}
