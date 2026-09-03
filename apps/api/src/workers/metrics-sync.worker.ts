import { Worker } from "bullmq";
import { prisma } from "@clip/db";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES } from "./queues";
import type { InstagramService } from "../modules/instagram/instagram.service";
import type { PerformanceService } from "../modules/performance/performance.service";

/**
 * Metrics Sync Worker — see docs/architecture/BACKGROUND_JOBS.md and
 * docs/performance/METRICS_ARCHITECTURE.md. Pulls current insights for
 * every VERIFIED reel in a still-tracked (LIVE/PAUSED) campaign and records
 * a snapshot, which in turn triggers qualified-performance calculation
 * (see PerformanceService.recordSnapshot).
 */
export function startMetricsSyncWorker(instagramService: InstagramService, performanceService: PerformanceService): Worker<Record<string, never>> {
  return new Worker(
    QUEUE_NAMES.metricsSync,
    async () => {
      const reels = await prisma.campaignReel.findMany({
        where: {
          status: "VERIFIED",
          campaignCreator: { campaign: { status: { in: ["LIVE", "PAUSED"] } } },
        },
        include: { campaignCreator: true },
      });

      let synced = 0;
      for (const reel of reels) {
        try {
          const insights = await instagramService.getMediaInsights(reel.campaignCreator.instagramAccountId, reel.platformMediaId.replace(/^ig:/, ""));
          if (!insights) continue;
          await performanceService.recordSnapshot({ reelId: reel.id, ...insights });
          synced++;
        } catch (err) {
          console.error(`Metrics sync failed for reel ${reel.id}`, err);
        }
      }

      return { checked: reels.length, synced };
    },
    { connection: createRedisConnection() }
  );
}
