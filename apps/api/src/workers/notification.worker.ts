import { Worker } from "bullmq";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES, type SendEmailJob } from "./queues";
import { getEnv } from "@clip/config";

/**
 * Notification Worker — fans out the email half of a notification. See
 * docs/architecture/BACKGROUND_JOBS.md and docs/operations/NOTIFICATION_SYSTEM.md.
 * Real provider delivery (EMAIL_PROVIDER_API_KEY) is a TODO — this logs
 * instead of silently no-op'ing, so the gap stays visible rather than hidden.
 */
export function startNotificationWorker(): Worker<SendEmailJob> {
  return new Worker<SendEmailJob>(
    QUEUE_NAMES.notifications,
    async (job) => {
      const env = getEnv();
      if (!env.EMAIL_PROVIDER_API_KEY) {
        console.log(`[email stub] would send "${job.data.title}" to user ${job.data.userId}`);
        return;
      }
      // Real provider call goes here once EMAIL_PROVIDER_API_KEY is configured.
      console.log(`[email] sending "${job.data.title}" to user ${job.data.userId}`);
    },
    { connection: createRedisConnection() }
  );
}
