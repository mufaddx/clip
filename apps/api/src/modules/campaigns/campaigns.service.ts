import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type CampaignStatus } from "@clip/db";
import type { UserRole } from "@clip/types";
import { WalletService } from "../wallet/wallet.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateCampaignDto } from "./dto/create-campaign.dto";
import type { UpdateCampaignDto } from "./dto/update-campaign.dto";

/**
 * Campaign lifecycle + creator matching/acceptance. See
 * docs/campaigns/CAMPAIGN_LIFECYCLE.md for the full state machine this
 * enforces and docs/campaigns/CAMPAIGN_RULES.md for the invariants.
 */
@Injectable()
export class CampaignsService {
  constructor(
    private readonly walletService: WalletService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Resolves the brand a user acts on behalf of — either they own it
   * (BrandProfile.userId) or they're an active team member of it. See
   * docs/users/TEAM_MEMBER_FLOW.md.
   */
  private async getBrandId(userId: string): Promise<string> {
    const brand = await prisma.brandProfile.findUnique({ where: { userId } });
    if (brand) return brand.id;

    const membership = await prisma.teamMember.findFirst({ where: { userId, removedAt: null } });
    if (membership) return membership.brandId;

    throw new ForbiddenException({ code: "NOT_A_BRAND", message: "This account has no brand access." });
  }

  /**
   * The wallet always belongs to the owner (BrandProfile.userId) — team
   * members never get their own wallet — so any wallet-touching action
   * (fund/cancel/complete) must resolve back to the owner's user id
   * regardless of which brand-side user triggered it.
   */
  private async getBrandOwnerUserId(brandId: string): Promise<string> {
    const brand = await prisma.brandProfile.findUniqueOrThrow({ where: { id: brandId } });
    return brand.userId;
  }

  private async getCreatorId(userId: string): Promise<string> {
    const creator = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException({ code: "NOT_A_CLIPPER", message: "This account has no creator profile." });
    return creator.id;
  }

  /** Object-level ownership check — a BRAND_OWNER role alone doesn't grant access to every campaign. See docs/api/API_AUTHORIZATION.md. */
  private async getOwnedCampaign(brandUserId: string, campaignId: string) {
    const brandId = await this.getBrandId(brandUserId);
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { requirements: true, assets: true },
    });
    if (!campaign) throw new NotFoundException({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign not found." });
    if (campaign.brandId !== brandId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "You do not own this campaign." });
    }
    return campaign;
  }

  private assertStatus(current: CampaignStatus, allowed: CampaignStatus[]) {
    if (!allowed.includes(current)) {
      throw new BadRequestException({
        code: "INVALID_CAMPAIGN_STATE",
        message: `Campaign is ${current}; expected one of ${allowed.join(", ")}.`,
      });
    }
  }

  // ── Creation (Step 1/2/3/4 folded into one draft create — see
  // docs/campaigns/CAMPAIGN_CREATION_FLOW.md) ──────────────────────────────

  /** Falls back to a placeholder rate until a SUPER_ADMIN sets a real one via /v1/admin/settings/rate_per_account. */
  private static readonly DEFAULT_RATE_PER_ACCOUNT = 100000; // minor units (₹1,000) per clipper account/post

  /**
   * Minor units per clipper account/post — see docs/admin/ADMIN_PANEL.md
   * "Settings". Priced per account rather than per view: how many views an
   * account gets is never guaranteed (it depends entirely on that
   * account's own reach), so promising a view count would be misleading —
   * a brand is buying a fixed number of clipper slots, not a view count.
   */
  async getRatePerAccount(): Promise<number> {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "rate_per_account" } });
    return typeof setting?.value === "number" ? setting.value : CampaignsService.DEFAULT_RATE_PER_ACCOUNT;
  }

  /**
   * How many clippers could actually accept a campaign targeting the given
   * categories right now — surfaced in the create-campaign wizard next to
   * "number of clipper accounts" so a brand isn't sizing a campaign against
   * inventory that doesn't exist. Mirrors eligibleCampaignsWhere()'s
   * category rule from the other direction: a creator with no categories
   * set is open to any campaign; a creator with categories set needs at
   * least one to overlap the campaign's targeting. Same ACTIVE-user,
   * not-risk-flagged, healthy-Instagram-account bar as actual eligibility.
   */
  async getEligibleCreatorCount(categoryIds: string[]): Promise<number> {
    return prisma.creatorProfile.count({
      where: {
        user: { status: "ACTIVE" },
        riskFlagged: false,
        instagramAccounts: { some: { connectionHealth: "HEALTHY" } },
        ...(categoryIds.length > 0
          ? { OR: [{ categories: { none: {} } }, { categories: { some: { categoryId: { in: categoryIds } } } }] }
          : {}),
      },
    });
  }

  async createDraft(brandUserId: string, dto: CreateCampaignDto) {
    const brandId = await this.getBrandId(brandUserId);

    // maxParticipants doubles as "how many clipper slots am I buying" — the
    // budget is derived from it at the current per-account rate rather
    // than the brand typing a raw ₹ amount directly. creatorBudget stays
    // settable directly too (kept for flexibility/back-compat) — the DTO
    // just has to give one or the other.
    let creatorBudget = dto.creatorBudget;
    if (dto.maxParticipants != null) {
      const ratePerAccount = await this.getRatePerAccount();
      creatorBudget = dto.maxParticipants * ratePerAccount;
    }
    if (creatorBudget == null) {
      throw new BadRequestException({ code: "BUDGET_REQUIRED", message: "Provide maxParticipants or creatorBudget." });
    }

    return prisma.campaign.create({
      data: {
        brandId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        objective: dto.objective,
        creatorBudget,
        durationDays: dto.durationDays,
        maxParticipants: dto.maxParticipants,
        platformFeeRate: 0, // locked in at funding time, not draft time — see CAMPAIGN_RULES.md
        status: "DRAFT",
        requirements: dto.requirements
          ? {
              create: {
                minFollowers: dto.requirements.minFollowers,
                minAccountAgeDays: dto.requirements.minAccountAgeDays,
                minTrustScore: dto.requirements.minTrustScore,
                contentRestrictions: dto.requirements.contentRestrictions ?? [],
                categories: dto.requirements.categoryIds
                  ? { connect: dto.requirements.categoryIds.map((id) => ({ id })) }
                  : undefined,
              },
            }
          : undefined,
        assets: dto.assets
          ? {
              create: dto.assets.map((a) => ({
                mediaUrl: a.mediaUrl,
                caption: a.caption,
                hashtags: a.hashtags ?? [],
                requiredMentions: a.requiredMentions ?? [],
                instructions: a.instructions,
              })),
            }
          : undefined,
      },
      include: { requirements: true, assets: true },
    });
  }

  async updateDraft(brandUserId: string, campaignId: string, dto: UpdateCampaignDto) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    // Objective/requirements lock once the first clipper accepts — see
    // docs/campaigns/CAMPAIGN_RULES.md "Objective & rules immutability".
    this.assertStatus(campaign.status, ["DRAFT"]);

    return prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        objective: dto.objective,
        creatorBudget: dto.creatorBudget,
        maxParticipants: dto.maxParticipants,
      },
      include: { requirements: true, assets: true },
    });
  }

  async listForBrand(brandUserId: string, status?: CampaignStatus) {
    const brandId = await this.getBrandId(brandUserId);
    return prisma.campaign.findMany({
      where: { brandId, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async getForBrand(brandUserId: string, campaignId: string) {
    return this.getOwnedCampaign(brandUserId, campaignId);
  }

  /** Per-creator breakdown for a campaign — see docs/ui-ux/PAGE_SPECIFICATIONS.md "Brand app" (Creator Performance). */
  async listCreatorsForBrand(brandUserId: string, campaignId: string) {
    await this.getOwnedCampaign(brandUserId, campaignId); // ownership check
    return prisma.campaignCreator.findMany({
      where: { campaignId },
      include: {
        creator: { select: { displayName: true, trustScore: true } },
        reels: { include: { metrics: true, calculations: { orderBy: { computedAt: "desc" }, take: 1 } } },
      },
      orderBy: { acceptedAt: "desc" },
    });
  }

  /**
   * Read-only detail for any authenticated role: full ownership-checked
   * access for the owning brand, a read view for clippers/staff (used by
   * the campaign detail page — a clipper needs to see requirements/assets
   * before and after accepting). See docs/api/API_AUTHORIZATION.md.
   */
  async getForActor(actorId: string, actorRole: UserRole, campaignId: string) {
    if (actorRole === "BRAND_OWNER" || actorRole === "BRAND_TEAM_MEMBER") {
      return this.getOwnedCampaign(actorId, campaignId);
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { requirements: true, assets: true },
    });
    if (!campaign) throw new NotFoundException({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign not found." });

    if (actorRole === "CLIPPER" && campaign.status === "DRAFT") {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "This campaign isn't published yet." });
    }

    return campaign;
  }

  // ── Lifecycle transitions — see docs/campaigns/CAMPAIGN_LIFECYCLE.md ─────

  async submit(brandUserId: string, campaignId: string) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    this.assertStatus(campaign.status, ["DRAFT"]);

    if (!campaign.requirements) {
      throw new BadRequestException({ code: "MISSING_REQUIREMENTS", message: "Creator requirements must be set before submitting." });
    }
    if (campaign.assets.length === 0) {
      throw new BadRequestException({ code: "MISSING_ASSETS", message: "At least one content asset is required before submitting." });
    }

    // SUBMITTED → PENDING_REVIEW is automatic per the docs (no separate user
    // action); we collapse it into one write since there's no queue-pickup
    // step to model yet.
    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "PENDING_REVIEW", submittedAt: new Date() },
    });
  }

  async approve(adminUserId: string, adminRole: UserRole, campaignId: string) {
    const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
    this.assertStatus(campaign.status, ["PENDING_REVIEW"]);

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "campaign.approve",
      targetType: "campaign",
      targetId: campaignId,
      before: { status: campaign.status },
      after: { status: "APPROVED" },
    });

    return updated;
  }

  async reject(adminUserId: string, adminRole: UserRole, campaignId: string, reason: string) {
    const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
    this.assertStatus(campaign.status, ["PENDING_REVIEW"]);

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "REJECTED", rejectedReason: reason },
    });

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "campaign.reject",
      targetType: "campaign",
      targetId: campaignId,
      before: { status: campaign.status },
      after: { status: "REJECTED", reason },
    });

    return updated;
  }

  /** APPROVED → FUNDED → LIVE. Platform fee rate is read and locked in now — see docs/campaigns/CAMPAIGN_RULES.md. */
  async fund(brandUserId: string, campaignId: string) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    this.assertStatus(campaign.status, ["APPROVED"]);

    const feeSetting = await prisma.systemSetting.findUnique({ where: { key: "platform_fee_rate" } });
    const platformFeeRate = typeof feeSetting?.value === "number" ? feeSetting.value : 0.15;
    const totalBudget = Math.round(campaign.creatorBudget * (1 + platformFeeRate));

    const ownerUserId = await this.getBrandOwnerUserId(campaign.brandId);
    await this.walletService.lockForCampaign(ownerUserId, campaignId, totalBudget);

    const now = new Date();
    return prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "LIVE",
        platformFeeRate,
        lockedAmount: totalBudget,
        fundedAt: now,
        liveAt: now,
      },
    });
  }

  async pause(brandUserId: string, campaignId: string) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    this.assertStatus(campaign.status, ["LIVE"]);
    return prisma.campaign.update({ where: { id: campaignId }, data: { status: "PAUSED" } });
  }

  async resume(brandUserId: string, campaignId: string) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    this.assertStatus(campaign.status, ["PAUSED"]);
    return prisma.campaign.update({ where: { id: campaignId }, data: { status: "LIVE" } });
  }

  /** Releases unspent LOCKED budget to REFUNDABLE — see docs/finance/REFUND_SYSTEM.md. */
  async cancel(brandUserId: string, campaignId: string) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    this.assertStatus(campaign.status, ["DRAFT", "SUBMITTED", "PENDING_REVIEW", "APPROVED", "FUNDED", "LIVE", "PAUSED"]);

    const remainingLocked = campaign.lockedAmount - campaign.spentAmount;
    if (remainingLocked > 0) {
      const ownerUserId = await this.getBrandOwnerUserId(campaign.brandId);
      await this.walletService.releaseLockToRefundable(ownerUserId, campaignId, remainingLocked);
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "CANCELLED", lockedAmount: campaign.spentAmount },
    });
  }

  async complete(brandUserId: string, campaignId: string) {
    const campaign = await this.getOwnedCampaign(brandUserId, campaignId);
    this.assertStatus(campaign.status, ["LIVE", "PAUSED"]);

    const remainingLocked = campaign.lockedAmount - campaign.spentAmount;
    if (remainingLocked > 0) {
      const ownerUserId = await this.getBrandOwnerUserId(campaign.brandId);
      await this.walletService.releaseLockToRefundable(ownerUserId, campaignId, remainingLocked);
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED", completedAt: new Date(), lockedAmount: campaign.spentAmount },
    });
  }

  // ── Creator matching + acceptance — see docs/campaigns/CREATOR_MATCHING.md ─

  /** The hard eligibility gate — shared by both listing and accept() so a clipper never accepts what they couldn't see. */
  private async eligibleCampaignsWhere(creatorId: string) {
    const creator = await prisma.creatorProfile.findUniqueOrThrow({
      where: { id: creatorId },
      include: { categories: true },
    });

    if (creator.riskFlagged) return null; // excluded from all recommendations until cleared — see docs/performance/QUALIFIED_PERFORMANCE.md

    // creator.categories was fetched here but never actually applied —
    // docs/campaigns/CREATOR_MATCHING.md "Eligibility gate" lists category
    // overlap as the *first* hard filter: a campaign with no category
    // requirements is open to everyone, otherwise the clipper's own
    // account categories must overlap the campaign's target categories.
    // An empty `in: []` correctly matches nothing, so a clipper with no
    // categories set naturally only sees untargeted campaigns — no
    // special-casing needed.
    const creatorCategoryIds = creator.categories.map((c) => c.categoryId);

    return {
      status: "LIVE" as const,
      AND: [
        {
          OR: [
            { requirements: { is: null } },
            { requirements: { is: { categories: { none: {} } } } },
            { requirements: { is: { categories: { some: { id: { in: creatorCategoryIds } } } } } },
          ],
        },
        {
          OR: [
            { requirements: { is: null } },
            { requirements: { is: { minTrustScore: null } } },
            { requirements: { is: { minTrustScore: { lte: creator.trustScore } } } },
          ],
        },
      ],
    };
  }

  async listAvailableForClipper(clipperUserId: string) {
    const creatorId = await this.getCreatorId(clipperUserId);
    const where = await this.eligibleCampaignsWhere(creatorId);
    if (!where) return [];

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { requirements: true, _count: { select: { creators: true } } },
      orderBy: { liveAt: "desc" },
    });

    // max_participants is a hard eligibility gate too (see
    // docs/campaigns/CREATOR_MATCHING.md "Eligibility gate") but can't be
    // expressed as a declarative Prisma `where` — it's comparing a
    // relation count against another scalar column on the same row — so
    // it's filtered here instead of in eligibleCampaignsWhere().
    return campaigns
      .filter((c) => c.maxParticipants == null || c._count.creators < c.maxParticipants)
      .map(({ _count, ...campaign }) => campaign);
  }

  async accept(clipperUserId: string, campaignId: string, instagramAccountId: string) {
    const creatorId = await this.getCreatorId(clipperUserId);
    const creator = await prisma.creatorProfile.findUniqueOrThrow({ where: { id: creatorId } });

    if (creator.riskFlagged) {
      throw new ForbiddenException({ code: "RISK_REVIEW", message: "Your account is under review and can't accept campaigns right now." });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { requirements: true, creators: true },
    });
    if (!campaign) throw new NotFoundException({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign not found." });
    this.assertStatus(campaign.status, ["LIVE"]);

    if (campaign.requirements?.minTrustScore != null && creator.trustScore < campaign.requirements.minTrustScore) {
      throw new ForbiddenException({ code: "NOT_ELIGIBLE", message: "You don't meet this campaign's minimum trust score." });
    }

    if (campaign.maxParticipants != null && campaign.creators.length >= campaign.maxParticipants) {
      throw new BadRequestException({ code: "CAMPAIGN_FULL", message: "This campaign has reached its maximum participants." });
    }

    const account = await prisma.instagramAccount.findUnique({ where: { id: instagramAccountId } });
    if (!account || account.creatorId !== creatorId) {
      throw new ForbiddenException({ code: "INVALID_INSTAGRAM_ACCOUNT", message: "That Instagram account isn't connected to your profile." });
    }

    return prisma.campaignCreator.create({
      data: { campaignId, creatorId, instagramAccountId, status: "ACCEPTED" },
    });
  }

  async listMyAcceptances(clipperUserId: string) {
    const creatorId = await this.getCreatorId(clipperUserId);
    return prisma.campaignCreator.findMany({
      where: { creatorId },
      include: { campaign: true, reels: true },
      orderBy: { acceptedAt: "desc" },
    });
  }
}
