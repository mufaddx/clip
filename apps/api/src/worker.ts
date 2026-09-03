import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Queue } from "bullmq";
import { AppModule } from "./app.module";
import { InstagramService } from "./modules/instagram/instagram.service";
import { startNotificationWorker } from "./workers/notification.worker";
import { startInstagramSyncWorker, enqueueExpiringAccountRefreshes } from "./workers/instagram-sync.worker";
import { startReferralRewardWorker } from "./workers/referral-reward.worker";
import { QUEUE_NAMES } from "./workers/queues";
import { createRedisConnection } from "./workers/connection";

/**
 * Background worker process entrypoint — deployed and scaled independently
 * from the HTTP API (see docs/architecture/BACKGROUND_JOBS.md and
 * docs/deployment/DEPLOYMENT_ARCHITECTURE.md "Why HTTP and workers are split").
 *
 * Boots a standalone Nest application context (no HTTP listener) so worker
 * processors can reuse the exact same service layer — and therefore the
 * exact same business rules — as the HTTP controllers, per
 * docs/architecture/BACKEND_ARCHITECTURE.md's layering rules.
 *
 * Implemented so far: Notification Worker, Instagram Sync Worker, Referral
 * Reward Worker (expiry sweep). Not yet implemented: Reel Detection,
 * Reel Verification, Metrics Sync, Performance Calculation, Campaign
 * Progress, and Earnings workers — those flows currently run inline on the
 * request path (see PerformanceService, ReelsService) rather than queued;
 * decoupling them is the next pass. See docs/README.md implementation status.
 */
async function bootstrapWorkers() {
  const appContext = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn", "log"] });
  const instagramService = appContext.get(InstagramService);

  const notificationWorker = startNotificationWorker();
  const instagramSyncWorker = startInstagramSyncWorker(instagramService);
  const referralRewardWorker = startReferralRewardWorker();

  // Repeatable jobs — see docs/architecture/BACKGROUND_JOBS.md "Scheduling".
  const scheduler = new Queue(QUEUE_NAMES.referralRewards, { connection: createRedisConnection() });
  await scheduler.add("expire-stale-referrals", {}, { repeat: { every: 24 * 60 * 60 * 1000 } }); // daily

  // The instagram-sync queue is fed by a lightweight interval here rather
  // than a repeatable BullMQ job, since it needs to *query* accounts and
  // enqueue N jobs (one per account), not run one job body itself.
  setInterval(() => {
    enqueueExpiringAccountRefreshes().catch((err) => console.error("enqueueExpiringAccountRefreshes failed", err));
  }, 60 * 60 * 1000); // hourly

  console.log("CLIP worker process started: notifications, instagram-sync, referral-rewards.");

  const shutdown = async () => {
    await Promise.all([notificationWorker.close(), instagramSyncWorker.close(), referralRewardWorker.close(), scheduler.close()]);
    await appContext.close();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrapWorkers();
