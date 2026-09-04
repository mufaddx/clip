import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { prisma } from "@clip/db";
import { ADMIN_ROLES, type UserRole } from "@clip/types";
import { InstagramService } from "../instagram/instagram.service";
import { MediaFingerprintService } from "./media-fingerprint.service";
import { reelVerificationQueue } from "../../workers/queues";

/**
 * Reel submission (both docs/campaigns/REEL_SUBMISSION.md paths — "Path A"
 * automatic detection via the Reel Detection Worker, and "Path B" manual
 * URL submission) + verification (docs/campaigns/REEL_VERIFICATION.md).
 *
 * Verification is real work — a Graph API ownership lookup plus a
 * content-hash download/compare — so a reel is created at
 * PENDING_VERIFICATION and the actual check runs on the Reel Verification
 * Worker, not inline on the submit request. See processVerification().
 */
@Injectable()
export class ReelsService {
  private readonly logger = new Logger(ReelsService.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly fingerprintService: MediaFingerprintService
  ) {}

  private async getOwnedAcceptance(clipperUserId: string, campaignCreatorId: string) {
    const creator = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: clipperUserId } });
    const acceptance = await prisma.campaignCreator.findUnique({
      where: { id: campaignCreatorId },
      include: { campaign: { include: { requirements: true, assets: true } } },
    });
    if (!acceptance) throw new NotFoundException({ code: "ACCEPTANCE_NOT_FOUND", message: "Campaign acceptance not found." });
    if (acceptance.creatorId !== creator.id) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "This acceptance doesn't belong to you." });
    }
    return acceptance;
  }

  async submit(clipperUserId: string, campaignCreatorId: string, url: string) {
    const acceptance = await this.getOwnedAcceptance(clipperUserId, campaignCreatorId);
    return this.createReel(acceptance, resolvePlatformMediaId(url), url, new Date());
  }

  /**
   * Path A — called by the Reel Detection Worker for media it finds on a
   * connected account, keyed by the real Graph API media id rather than a
   * URL-derived stand-in. See docs/architecture/BACKGROUND_JOBS.md
   * "Reel Detection Worker".
   */
  async detectFromMedia(campaignCreatorId: string, platformMediaId: string, url: string, publishedAt: Date) {
    const acceptance = await prisma.campaignCreator.findUniqueOrThrow({
      where: { id: campaignCreatorId },
      include: { campaign: { include: { requirements: true, assets: true } } },
    });
    return this.createReel(acceptance, platformMediaId, url, publishedAt);
  }

  private async createReel(
    acceptance: Awaited<ReturnType<ReelsService["getOwnedAcceptance"]>>,
    platformMediaId: string,
    url: string,
    publishedAt: Date
  ) {
    if (!["ACCEPTED", "SUBMITTED"].includes(acceptance.status)) {
      throw new BadRequestException({
        code: "ACCEPTANCE_NOT_ACTIVE",
        message: "This campaign acceptance can no longer accept new submissions.",
      });
    }

    let reel;
    try {
      reel = await prisma.campaignReel.create({
        data: { campaignCreatorId: acceptance.id, platformMediaId, url, publishedAt, status: "PENDING_VERIFICATION" },
      });
    } catch {
      // Unique constraint on platformMediaId — see docs/campaigns/REEL_SUBMISSION.md
      // "A single media item can only be attributed to one campaign acceptance."
      throw new ConflictException({ code: "REEL_ALREADY_SUBMITTED", message: "This reel has already been submitted." });
    }

    await prisma.campaignCreator.update({ where: { id: acceptance.id }, data: { status: "SUBMITTED" } });
    await reelVerificationQueue.add("verify", { reelId: reel.id });

    return { ...reel, verification: { status: "PENDING_VERIFICATION" as const } };
  }

  /**
   * Runs on the Reel Verification Worker — the real check, not a guess:
   *
   *  1. Ownership: the reel must actually appear on the clipper's OWN
   *     connected Instagram account, confirmed via a live Graph API media
   *     list (never the submitted URL alone) — see docs/campaigns/
   *     REEL_VERIFICATION.md "Account ownership".
   *  2. Timing: uses Instagram's own reported publish timestamp, not the
   *     client-supplied one, to check it was posted after acceptance.
   *  3. Content: a perceptual-hash similarity check against the campaign's
   *     uploaded creative, when both are available — a low score escalates
   *     to manual review, it never silently rejects or silently passes.
   *  4. Mention/hashtag compliance still can't be read from Graph API media
   *     fields reliably, so it still routes to a human — see (3)'s pattern.
   *
   * Any step this worker genuinely can't resolve (API error, missing
   * config, fingerprinting failure) escalates to MANUAL_REVIEW rather than
   * defaulting either direction — see docs/campaigns/REEL_VERIFICATION.md.
   */
  async processVerification(reelId: string): Promise<{ status: string; reason?: string }> {
    const reel = await prisma.campaignReel.findUniqueOrThrow({
      where: { id: reelId },
      include: {
        campaignCreator: { include: { campaign: { include: { assets: true } }, creator: true } },
      },
    });
    const acceptance = reel.campaignCreator;

    let status: "VERIFIED" | "REJECTED" | "MANUAL_REVIEW";
    let reason: string | undefined;

    if (!/instagram\.com/.test(reel.url)) {
      status = "REJECTED";
      reason = "URL does not look like an Instagram reel/post link.";
    } else {
      const ownership = await this.checkOwnership(acceptance.instagramAccountId, reel.url);

      if (ownership === "API_ERROR") {
        status = "MANUAL_REVIEW";
        reason = "Couldn't verify this reel against Instagram right now — needs manual review.";
      } else if (!ownership.match) {
        status = "REJECTED";
        reason = "This reel was not found on your connected Instagram account.";
      } else if (acceptance.acceptedAt > ownership.match.publishedAt) {
        status = "REJECTED";
        reason = "Reel was published before this campaign was accepted.";
      } else {
        const asset = acceptance.campaign.assets[0];
        const contentCheck = asset ? await this.checkContentMatch(asset.mediaUrl, ownership.match) : null;

        if (contentCheck === false) {
          status = "MANUAL_REVIEW";
          reason = "Posted content doesn't clearly match the campaign creative — needs manual review.";
        } else if (asset && (asset.requiredMentions.length > 0 || asset.hashtags.length > 0)) {
          status = "MANUAL_REVIEW";
          reason = "Caption/hashtag/mention compliance requires manual review.";
        } else {
          status = "VERIFIED";
        }
      }
    }

    await prisma.$transaction([
      prisma.campaignReel.update({ where: { id: reelId }, data: { status } }),
      prisma.reelVerification.create({ data: { reelId, status, reason } }),
    ]);

    if (status === "VERIFIED") {
      await prisma.campaignCreator.update({ where: { id: acceptance.id }, data: { status: "TRACKING" } });
    }

    return { status, reason };
  }

  /**
   * Confirms the submitted URL genuinely belongs to the clipper's connected
   * account by matching it against that account's own recent media list —
   * the same Graph API call the Reel Detection Worker already trusts for
   * Path A, applied here to Path B (manual submission) too. Matches by
   * permalink rather than platformMediaId, since a manually-typed URL only
   * carries a public shortcode, not Instagram's internal media id.
   */
  private async checkOwnership(
    instagramAccountId: string,
    submittedUrl: string
  ): Promise<"API_ERROR" | { match: { publishedAt: Date; mediaUrl?: string; thumbnailUrl?: string } | null }> {
    try {
      const recent = await this.instagramService.listRecentMedia(instagramAccountId, 50);
      const target = normalizePermalink(submittedUrl);
      const found = recent.find((m) => normalizePermalink(m.permalink) === target);
      if (!found) return { match: null };
      return {
        match: {
          publishedAt: new Date(found.timestamp),
          mediaUrl: found.media_url,
          thumbnailUrl: found.thumbnail_url,
        },
      };
    } catch (err) {
      this.logger.warn(`Ownership check failed for account ${instagramAccountId}: ${err instanceof Error ? err.message : err}`);
      return "API_ERROR";
    }
  }

  /**
   * true = looks like the same content, false = looks different (escalate),
   * null = couldn't compute (missing asset/media URL, ffmpeg unavailable,
   * download failure) — treated as "no signal" by the caller, not a pass.
   */
  private async checkContentMatch(
    assetMediaUrl: string,
    postedMedia: { mediaUrl?: string; thumbnailUrl?: string }
  ): Promise<boolean | null> {
    const postedUrl = postedMedia.mediaUrl ?? postedMedia.thumbnailUrl;
    if (!postedUrl) return null;

    const SIMILARITY_THRESHOLD = 0.8; // dHash Hamming similarity — tolerant of Instagram's re-encoding

    try {
      const [assetHash, postedHash] = await Promise.all([
        this.fingerprintService.computeHash(assetMediaUrl),
        this.fingerprintService.computeHash(postedUrl),
      ]);
      return this.fingerprintService.similarity(assetHash, postedHash) >= SIMILARITY_THRESHOLD;
    } catch (err) {
      this.logger.warn(`Content-match check failed: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  /**
   * Object-level scoping — a reel is visible to the clipper who submitted
   * it, the brand who owns its campaign, or platform staff. See
   * docs/api/API_AUTHORIZATION.md "Object-level authorization".
   */
  async getReel(actorId: string, actorRole: UserRole, reelId: string) {
    const reel = await prisma.campaignReel.findUnique({
      where: { id: reelId },
      include: {
        verifications: true,
        metrics: true,
        campaignCreator: { include: { campaign: { include: { brand: true } }, creator: true } },
      },
    });
    if (!reel) throw new NotFoundException({ code: "REEL_NOT_FOUND", message: "Reel not found." });

    const isStaff = ADMIN_ROLES.includes(actorRole);
    const isOwningClipper = reel.campaignCreator.creator.userId === actorId;
    const isOwningBrand = reel.campaignCreator.campaign.brand.userId === actorId;
    if (!isStaff && !isOwningClipper && !isOwningBrand) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "You don't have access to this reel." });
    }

    return reel;
  }
}

function resolvePlatformMediaId(url: string): string {
  const match = url.match(/\/(reel|p)\/([^/?]+)/);
  return match ? `ig:${match[2]}` : `raw:${Buffer.from(url).toString("base64url")}`;
}

/** Strips scheme/www/trailing-slash/query so a pasted URL and Graph API's own permalink compare equal. */
function normalizePermalink(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "")).toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
