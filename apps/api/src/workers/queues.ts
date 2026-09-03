import { Queue } from "bullmq";
import { createRedisConnection } from "./connection";

/**
 * Queue name registry — see docs/architecture/BACKGROUND_JOBS.md "Worker
 * registry" for what each queue is for. Only the queues with a real worker
 * implemented so far are instantiated here; the rest (reel-detection,
 * reel-verification, campaign-progress) are documented but not yet built —
 * see docs/README.md implementation status.
 */
export const QUEUE_NAMES = {
  instagramSync: "instagram-sync",
  notifications: "notifications",
  referralRewards: "referral-rewards",
} as const;

const connection = createRedisConnection();

export const instagramSyncQueue = new Queue(QUEUE_NAMES.instagramSync, { connection });
export const notificationsQueue = new Queue(QUEUE_NAMES.notifications, { connection });
export const referralRewardsQueue = new Queue(QUEUE_NAMES.referralRewards, { connection });

export interface SendEmailJob {
  userId: string;
  title: string;
  body: string;
}
