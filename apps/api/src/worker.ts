import "reflect-metadata";
import { initSentry, Sentry } from "./common/sentry";
initSentry();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { InstagramService } from "./modules/instagram/instagram.service";
import { PerformanceService } from "./modules/performance/performance.service";
import { ReelsService } from "./modules/reels/reels.service";
import { WalletService } from "./modules/wallet/wallet.service";
import { startNotificationWorker } from "./workers/notification.worker";
import { startInstagramSyncWorker, enqueueExpiringAccountRefreshes } from "./workers/instagram-sync.worker";
import { startReferralRewardWorker } from "./workers/referral-reward.worker";
import { startReelDetectionWorker } from "./workers/reel-detection.worker";
import { startMetricsSyncWorker } from "./workers/metrics-sync.worker";
import { startEarningsWorker } from "./workers/earnings.worker";
import { referralRewardsQueue, reelDetectionQueue, metricsSyncQueue, earningsQueue } from "./workers/queues";

/**
 * Background worker process entrypoint — deployed and scaled independently
 * from the HTTP API (see docs/architecture/BACKGROUND_JOBS.md and
 * docs/deployment/DEPLOYMENT_ARCHITECTURE.md "Why HTTP and workers are split").
 *
 * Boots a standalone Nest application context (no HTTP listener) so worker
 * processors can reuse the exact same service layer as the HTTP controllers
 * — see docs/architecture/BACKEND_ARCHITECTURE.md's layering rules.
 *
 * Registry vs. docs/architecture/BACKGROUND_JOBS.md: 7 of 9 documented
 * workers run as real BullMQ workers here (Instagram Sync, Reel Detection,
 * Metrics Sync, Earnings, Notification, Referral Reward, plus the expiry
 * sweep). Reel Verification is deliberately inline (fast, local, no
 * external call to decouple — see ReelsService); Campaign Progress is
 * deliberately live-computed (see AnalyticsService) rather than cached.
 */
async function bootstrapWorkers() {
  const appContext = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn", "log"] });
  const instagramService = appContext.get(InstagramService);
  const performanceService = appContext.get(PerformanceService);
  const reelsService = appContext.get(ReelsService);
  const walletService = appContext.get(WalletService);

  const workers = [
    startNotificationWorker(),
    startInstagramSyncWorker(instagramService),
    startReferralRewardWorker(),
    startReelDetectionWorker(instagramService, reelsService),
    startMetricsSyncWorker(instagramService, performanceService),
    startEarningsWorker(walletService),
  ];

  // A job that exhausts its retries (see docs/architecture/BACKGROUND_JOBS.md
  // "Dead letter handling") is exactly the kind of thing Sentry should know
  // about — no-ops if SENTRY_DSN isn't set.
  for (const w of workers) {
    w.on("failed", (job, err) => {
      Sentry.captureException(err, { tags: { queue: w.name, jobId: job?.id } });
    });
  }

  // Repeatable jobs — see docs/architecture/BACKGROUND_JOBS.md "Scheduling".
  await referralRewardsQueue.add("expire-stale-referrals", {}, { repeat: { every: 24 * 60 * 60 * 1000 } }); // daily
  await reelDetectionQueue.add("sweep", {}, { repeat: { every: 15 * 60 * 1000 } }); // every 15 min
  await metricsSyncQueue.add("sweep", {}, { repeat: { every: 60 * 60 * 1000 } }); // hourly
  await earningsQueue.add("settle", {}, { repeat: { every: 6 * 60 * 60 * 1000 } }); // every 6 hours

  // instagram-sync is fed by an interval (not a repeatable job body) since
  // it needs to *query* accounts and enqueue N jobs, one per account, to
  // stagger them against Meta's rate limit — see
  // docs/architecture/META_INSTAGRAM_INTEGRATION.md "Rate limits".
  setInterval(() => {
    enqueueExpiringAccountRefreshes().catch((err) => console.error("enqueueExpiringAccountRefreshes failed", err));
  }, 60 * 60 * 1000); // hourly

  console.log("Vidlix worker process started: notifications, instagram-sync, reel-detection, metrics-sync, earnings, referral-rewards.");

  const shutdown = async () => {
    await Promise.all(workers.map((w) => w.close()));
    await Promise.all([referralRewardsQueue.close(), reelDetectionQueue.close(), metricsSyncQueue.close(), earningsQueue.close()]);
    await appContext.close();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrapWorkers();
