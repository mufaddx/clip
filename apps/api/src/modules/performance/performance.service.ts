import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type CampaignObjective } from "@clip/db";
import type { UserRole } from "@clip/types";
import { WalletService } from "../wallet/wallet.service";
import { AuditService } from "../../common/audit/audit.service";
import type { RecordSnapshotDto } from "./dto/record-snapshot.dto";
import type { UpdatePerformanceRulesDto } from "./dto/update-rules.dto";

interface Weights {
  watchQuality: number;
  engagementQuality: number;
  reachQuality: number;
  campaignCompliance: number;
  historicalReliability: number;
}

/**
 * The performance pipeline: raw metric snapshots → qualified performance
 * calculation → earnings. See docs/performance/PERFORMANCE_SYSTEM.md for
 * the full layering this implements.
 */
@Injectable()
export class PerformanceService {
  constructor(
    private readonly walletService: WalletService,
    private readonly auditService: AuditService
  ) {}

  // ── Raw metrics / snapshots — see docs/performance/METRIC_SNAPSHOTS.md ────
  // Snapshots are append-only; ReelMetric holds the fast "latest known" copy.

  async recordSnapshot(dto: RecordSnapshotDto) {
    const reel = await prisma.campaignReel.findUnique({ where: { id: dto.reelId } });
    if (!reel) throw new NotFoundException({ code: "REEL_NOT_FOUND", message: "Reel not found." });

    const values = {
      views: dto.views,
      reach: dto.reach,
      likes: dto.likes,
      comments: dto.comments,
      shares: dto.shares,
      saves: dto.saves,
    };
    const availableFields = Object.entries(values)
      .filter(([, v]) => v != null)
      .map(([k]) => k);

    const [snapshot] = await prisma.$transaction([
      prisma.metricSnapshot.create({ data: { reelId: dto.reelId, ...values, availableFields } }),
      prisma.reelMetric.upsert({
        where: { reelId: dto.reelId },
        create: { reelId: dto.reelId, ...values },
        update: values,
      }),
    ]);

    // Only a VERIFIED reel's metrics ever feed a payout — see
    // docs/performance/QUALIFIED_PERFORMANCE.md "Preconditions".
    if (reel.status === "VERIFIED") {
      await this.calculateForReel(dto.reelId, snapshot.id);
    }

    return snapshot;
  }

  // ── Qualified performance — see docs/performance/QUALIFIED_PERFORMANCE.md ─

  private async getActiveRule(objective: CampaignObjective) {
    const rule = await prisma.performanceRule.findFirst({
      where: { objective, isActive: true },
      orderBy: { version: "desc" },
    });
    if (!rule) throw new NotFoundException({ code: "NO_ACTIVE_RULE", message: `No active performance rule for ${objective}.` });
    return rule;
  }

  /**
   * Simplified scoring: normalizes whatever raw fields are available against
   * a soft ceiling per factor, applies the rule's weights, and clamps to
   * [0, 1]. Missing fields contribute 0 to their factor rather than being
   * fabricated — see docs/performance/METRICS_ARCHITECTURE.md.
   */
  private computeScore(
    snapshot: { views: number | null; reach: number | null; likes: number | null; comments: number | null; shares: number | null; saves: number | null },
    weights: Weights,
    compliancePassed: boolean
  ): number {
    const engagement = (snapshot.likes ?? 0) + (snapshot.comments ?? 0) * 2 + (snapshot.shares ?? 0) * 3 + (snapshot.saves ?? 0) * 2;
    const reach = snapshot.reach ?? 0;
    const views = snapshot.views ?? 0;

    const watchQuality = clamp01(views > 0 ? Math.min(views, 10_000) / 10_000 : 0);
    const engagementQuality = clamp01(reach > 0 ? engagement / (reach * 0.1) : 0);
    const reachQuality = clamp01(reach / 50_000);
    const campaignCompliance = compliancePassed ? 1 : 0;
    const historicalReliability = 1; // fed by the creator's trust score in a later pass

    return clamp01(
      watchQuality * weights.watchQuality +
        engagementQuality * weights.engagementQuality +
        reachQuality * weights.reachQuality +
        campaignCompliance * weights.campaignCompliance +
        historicalReliability * weights.historicalReliability
    );
  }

  async calculateForReel(reelId: string, snapshotIdOverride?: string) {
    const reel = await prisma.campaignReel.findUnique({
      where: { id: reelId },
      include: {
        campaignCreator: { include: { campaign: { include: { brand: true } }, creator: true } },
        snapshots: { orderBy: { collectedAt: "desc" }, take: 1 },
      },
    });
    if (!reel) throw new NotFoundException({ code: "REEL_NOT_FOUND", message: "Reel not found." });
    if (reel.status !== "VERIFIED") {
      throw new BadRequestException({ code: "REEL_NOT_VERIFIED", message: "Only verified reels produce qualified performance." });
    }

    const snapshot = snapshotIdOverride
      ? await prisma.metricSnapshot.findUniqueOrThrow({ where: { id: snapshotIdOverride } })
      : reel.snapshots[0];
    if (!snapshot) throw new BadRequestException({ code: "NO_SNAPSHOT", message: "No metric snapshot to calculate from." });

    const campaign = reel.campaignCreator.campaign;
    const rule = await this.getActiveRule(campaign.objective);
    const weights = rule.weights as unknown as Weights;

    const score = this.computeScore(snapshot, weights, true);

    const calculation = await prisma.performanceCalculation.create({
      data: { reelId, ruleId: rule.id, snapshotId: snapshot.id, score },
    });

    // Simplified payout model: this reel earns `score` (0..1) of the
    // campaign's remaining creator budget, capped so cumulative spend never
    // exceeds creatorBudget. Real Earnings Worker semantics (PENDING window,
    // per-campaign payout curve config) land with the background workers —
    // see docs/finance/CREATOR_EARNINGS.md.
    const remaining = campaign.creatorBudget - campaign.spentAmount;
    const amount = Math.min(Math.round(campaign.creatorBudget * score * 0.1), remaining);

    if (amount > 0) {
      await this.walletService.postEarning(
        campaign.brand.userId,
        reel.campaignCreator.creator.userId,
        campaign.id,
        reelId,
        amount
      );
      await prisma.campaign.update({ where: { id: campaign.id }, data: { spentAmount: { increment: amount } } });
    }

    return calculation;
  }

  // ── Rule configuration — SUPER_ADMIN only, see docs/performance/PERFORMANCE_SCORING.md ─

  async updateRules(adminUserId: string, adminRole: UserRole, dto: UpdatePerformanceRulesDto) {
    const current = await prisma.performanceRule.findFirst({
      where: { objective: dto.objective },
      orderBy: { version: "desc" },
    });
    const nextVersion = (current?.version ?? 0) + 1;

    const [, created] = await prisma.$transaction([
      prisma.performanceRule.updateMany({ where: { objective: dto.objective, isActive: true }, data: { isActive: false } }),
      prisma.performanceRule.create({
        data: {
          objective: dto.objective,
          version: nextVersion,
          isActive: true,
          weights: dto.weights,
          riskThresholds: { anomalyZScoreFlag: dto.anomalyZScoreFlag },
          createdBy: adminUserId,
        },
      }),
    ]);

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "performance_rules.update",
      targetType: "performance_rule",
      targetId: created.id,
      before: current ? { version: current.version, weights: current.weights } : null,
      after: { version: created.version, weights: created.weights },
    });

    return created;
  }

  async getRules(objective: CampaignObjective) {
    return this.getActiveRule(objective);
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
