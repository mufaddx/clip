import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@clip/db";
import { ADMIN_ROLES, type UserRole } from "@clip/types";

/**
 * Reel submission (both docs/campaigns/REEL_SUBMISSION.md paths — "Path A"
 * automatic detection via the Reel Detection Worker, and "Path B" manual
 * URL submission) + rule verification (docs/campaigns/REEL_VERIFICATION.md).
 */
@Injectable()
export class ReelsService {
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
    return this.createAndVerify(acceptance, resolvePlatformMediaId(url), url, new Date());
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
    return this.createAndVerify(acceptance, platformMediaId, url, publishedAt);
  }

  private async createAndVerify(
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
        data: { campaignCreatorId: acceptance.id, platformMediaId, url, publishedAt },
      });
    } catch {
      // Unique constraint on platformMediaId — see docs/campaigns/REEL_SUBMISSION.md
      // "A single media item can only be attributed to one campaign acceptance."
      throw new ConflictException({ code: "REEL_ALREADY_SUBMITTED", message: "This reel has already been submitted." });
    }

    await prisma.campaignCreator.update({ where: { id: acceptance.id }, data: { status: "SUBMITTED" } });

    const outcome = await this.verify(reel.id, acceptance);
    return { ...reel, verification: outcome };
  }

  /**
   * Simplified rule engine — checks what's checkable without real Graph API
   * media metadata (ownership is implicit since the acceptance is the
   * clipper's own; publish window and content-rule checks are approximated).
   * Ambiguous/unautomatable checks route to MANUAL_REVIEW, never a silent
   * pass — see docs/campaigns/REEL_VERIFICATION.md.
   */
  private async verify(
    reelId: string,
    acceptance: Awaited<ReturnType<ReelsService["getOwnedAcceptance"]>>
  ) {
    const reel = await prisma.campaignReel.findUniqueOrThrow({ where: { id: reelId } });
    const withinWindow = acceptance.acceptedAt <= (reel.publishedAt ?? reel.submittedAt);
    const looksLikeInstagram = /instagram\.com/.test(reel.url);

    let status: "VERIFIED" | "REJECTED" | "MANUAL_REVIEW";
    let reason: string | undefined;

    if (!looksLikeInstagram) {
      status = "REJECTED";
      reason = "URL does not look like an Instagram reel/post link.";
    } else if (!withinWindow) {
      status = "REJECTED";
      reason = "Reel was published before this campaign was accepted.";
    } else if (acceptance.campaign.assets.some((a) => a.requiredMentions.length > 0 || a.hashtags.length > 0)) {
      // Caption/hashtag/mention compliance can't be verified without real
      // media metadata yet — queue for a human rather than guessing.
      status = "MANUAL_REVIEW";
      reason = "Caption/hashtag/mention compliance requires manual review.";
    } else {
      status = "VERIFIED";
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
