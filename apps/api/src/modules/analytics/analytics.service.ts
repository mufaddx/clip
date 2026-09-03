import { ForbiddenException, Injectable } from "@nestjs/common";
import { prisma } from "@clip/db";

/**
 * Read-only aggregate views — see docs/operations/ANALYTICS_SYSTEM.md and
 * docs/operations/REPORTING_SYSTEM.md. Computed directly from source tables
 * rather than precomputed materialized rows (see
 * docs/architecture/SCALABILITY_ARCHITECTURE.md) — fine at this scale, the
 * first thing to revisit if these queries ever get slow.
 */
@Injectable()
export class AnalyticsService {
  async brandOverview(brandUserId: string) {
    const brand = await prisma.brandProfile.findUnique({ where: { userId: brandUserId } });
    if (!brand) throw new ForbiddenException({ code: "NOT_A_BRAND", message: "This account has no brand profile." });

    const campaigns = await prisma.campaign.findMany({ where: { brandId: brand.id } });
    const activeCampaigns = campaigns.filter((c) => c.status === "LIVE").length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.lockedAmount, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spentAmount, 0);

    const calculations = await prisma.performanceCalculation.findMany({
      where: { reel: { campaignCreator: { campaign: { brandId: brand.id } } } },
      select: { score: true, computedAt: true },
      orderBy: { computedAt: "asc" },
    });
    const totalQualifiedPerformance = calculations.reduce((sum, c) => sum + c.score, 0);

    return {
      activeCampaigns,
      totalCampaigns: campaigns.length,
      totalBudget,
      totalSpent,
      totalQualifiedPerformance,
      performanceTrend: calculations,
    };
  }

  async clipperOverview(clipperUserId: string) {
    const creator = await prisma.creatorProfile.findUnique({ where: { userId: clipperUserId } });
    if (!creator) throw new ForbiddenException({ code: "NOT_A_CLIPPER", message: "This account has no creator profile." });

    const acceptances = await prisma.campaignCreator.findMany({ where: { creatorId: creator.id } });
    const activeCampaigns = acceptances.filter((a) => ["ACCEPTED", "SUBMITTED", "TRACKING"].includes(a.status)).length;
    const completedCampaigns = acceptances.filter((a) => a.status === "COMPLETED").length;

    const calculations = await prisma.performanceCalculation.findMany({
      where: { reel: { campaignCreator: { creatorId: creator.id } } },
      select: { score: true, computedAt: true },
      orderBy: { computedAt: "asc" },
    });
    const totalQualifiedPerformance = calculations.reduce((sum, c) => sum + c.score, 0);

    return { activeCampaigns, completedCampaigns, totalQualifiedPerformance, performanceTrend: calculations };
  }

  /** Admin dashboard stat row — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Admin dashboard home". */
  async platformOverview() {
    const [totalUsers, totalBrands, totalClippers, activeCampaigns, campaigns, pendingWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.brandProfile.count(),
      prisma.creatorProfile.count(),
      prisma.campaign.count({ where: { status: "LIVE" } }),
      prisma.campaign.findMany({ select: { lockedAmount: true, spentAmount: true, platformFeeRate: true, creatorBudget: true } }),
      prisma.withdrawal.count({ where: { status: { in: ["REQUESTED", "APPROVED", "PROCESSING"] } } }),
    ]);

    const totalCampaignBudget = campaigns.reduce((sum, c) => sum + c.lockedAmount, 0);
    // Platform revenue = fee portion of what's actually been spent, not the whole locked budget.
    const platformRevenue = campaigns.reduce((sum, c) => sum + Math.round(c.spentAmount * c.platformFeeRate), 0);

    const totalQualifiedPerformance = await prisma.performanceCalculation.aggregate({ _sum: { score: true } });

    return {
      totalUsers,
      totalBrands,
      totalClippers,
      activeCampaigns,
      totalCampaignBudget,
      platformRevenue,
      totalQualifiedPerformance: totalQualifiedPerformance._sum.score ?? 0,
      pendingWithdrawals,
    };
  }
}
