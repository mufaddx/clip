import { IsIn, IsNumber, IsObject } from "class-validator";
import type { CampaignObjective } from "@clip/db";

const OBJECTIVES: CampaignObjective[] = ["DISTRIBUTION", "VIEWS", "REACH", "ENGAGEMENT", "QUALITY_PERFORMANCE"];

/**
 * Saving creates a new version rather than editing in place — see
 * docs/performance/PERFORMANCE_SCORING.md. SUPER_ADMIN only.
 */
export class UpdatePerformanceRulesDto {
  @IsIn(OBJECTIVES)
  objective!: CampaignObjective;

  @IsObject()
  weights!: {
    watchQuality: number;
    engagementQuality: number;
    reachQuality: number;
    campaignCompliance: number;
    historicalReliability: number;
  };

  @IsNumber()
  anomalyZScoreFlag!: number;
}
