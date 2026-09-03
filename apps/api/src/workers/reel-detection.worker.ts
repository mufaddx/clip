import { Worker } from "bullmq";
import { prisma } from "@clip/db";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES } from "./queues";
import type { InstagramService } from "../modules/instagram/instagram.service";
import type { ReelsService } from "../modules/reels/reels.service";

/**
 * Reel Detection Worker — "Path A" of docs/campaigns/REEL_SUBMISSION.md.
 * For every accepted campaign with no reel yet, checks the clipper's
 * connected account for new media published after acceptance and attributes
 * it automatically, falling back to nothing (the clipper can still submit
 * manually) if none is found or the account has no valid token.
 */
export function startReelDetectionWorker(
  instagramService: InstagramService,
  reelsService: ReelsService
): Worker<Record<string, never>> {
  return new Worker(
    QUEUE_NAMES.reelDetection,
    async () => {
      const pendingAcceptances = await prisma.campaignCreator.findMany({
        where: { status: "ACCEPTED", reels: { none: {} } },
        include: { instagramAccount: true },
      });

      let detected = 0;
      for (const acceptance of pendingAcceptances) {
        if (acceptance.instagramAccount.connectionHealth !== "HEALTHY") continue;

        try {
          const media = await instagramService.listRecentMedia(acceptance.instagramAccountId, 10);
          const match = media.find((m) => new Date(m.timestamp) >= acceptance.acceptedAt);
          if (!match) continue;

          await reelsService.detectFromMedia(acceptance.id, `ig:${match.id}`, match.permalink, new Date(match.timestamp));
          detected++;
        } catch (err) {
          // A single account's failure (expired token, rate limit) must not
          // stop the sweep for everyone else.
          console.error(`Reel detection failed for acceptance ${acceptance.id}`, err);
        }
      }

      return { checked: pendingAcceptances.length, detected };
    },
    { connection: createRedisConnection() }
  );
}
