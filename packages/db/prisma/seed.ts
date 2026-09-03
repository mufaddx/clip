/**
 * Seed script — enough for a fresh environment to be functional.
 * Never seeds fake user/financial data outside local dev.
 * See docs/database/MIGRATION_STRATEGY.md.
 */
import { prisma, CampaignObjective } from "../src/index";

async function main() {
  // Content/industry category taxonomy
  const categories = [
    "Beauty",
    "Fashion",
    "Fitness",
    "Food",
    "Gaming",
    "Tech",
    "Travel",
    "Finance",
    "Comedy",
    "Lifestyle",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase() },
      update: {},
      create: { name, slug: name.toLowerCase() },
    });
  }

  // Default performance rule versions, one per objective type — see
  // docs/performance/PERFORMANCE_SCORING.md for the shape of `weights`.
  const objectives: CampaignObjective[] = [
    "DISTRIBUTION",
    "VIEWS",
    "REACH",
    "ENGAGEMENT",
    "QUALITY_PERFORMANCE",
  ];

  for (const objective of objectives) {
    await prisma.performanceRule.upsert({
      where: { objective_version: { objective, version: 1 } },
      update: {},
      create: {
        objective,
        version: 1,
        isActive: true,
        weights: {
          watchQuality: 0.2,
          engagementQuality: 0.25,
          reachQuality: 0.2,
          campaignCompliance: 0.2,
          historicalReliability: 0.15,
        },
        riskThresholds: {
          anomalyZScoreFlag: 3.0,
        },
      },
    });
  }

  // Default platform-wide settings
  await prisma.systemSetting.upsert({
    where: { key: "platform_fee_rate" },
    update: {},
    create: { key: "platform_fee_rate", value: 0.15 },
  });

  await prisma.systemSetting.upsert({
    where: { key: "earnings_settlement_window_days" },
    update: {},
    create: { key: "earnings_settlement_window_days", value: 7 },
  });

  await prisma.systemSetting.upsert({
    where: { key: "referral_rules" },
    update: {},
    create: {
      key: "referral_rules",
      value: {
        rewardType: "FIXED",
        rewardAmount: 500, // minor units
        maxReward: 5000,
        expirationDays: 90,
        perUserCap: 20,
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
