import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import type { CampaignObjective } from "@clip/db";

const OBJECTIVES: CampaignObjective[] = ["DISTRIBUTION", "VIEWS", "REACH", "ENGAGEMENT", "QUALITY_PERFORMANCE"];

// Step 3 — Creator Requirements. See docs/campaigns/CAMPAIGN_CREATION_FLOW.md.
export class CampaignRequirementsDto {
  @IsOptional()
  @IsInt()
  minFollowers?: number;

  @IsOptional()
  @IsInt()
  minAccountAgeDays?: number;

  @IsOptional()
  minTrustScore?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentRestrictions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

// Step 1 — Basic Information + Step 5 — Budget. Step 2 (Content) and Step 4
// (Performance Targets/objective) are folded in here for a single-call
// draft create; Step 6 (Review) happens client-side before /submit.
export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(OBJECTIVES)
  objective!: CampaignObjective;

  /** Minor units — the creator budget pool, before platform fee. */
  @IsInt()
  @IsPositive()
  creatorBudget!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxParticipants?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignRequirementsDto)
  requirements?: CampaignRequirementsDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  assets?: CampaignAssetDto[];
}

export class CampaignAssetDto {
  @IsString()
  mediaUrl!: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredMentions?: string[];

  @IsOptional()
  @IsString()
  instructions?: string;
}
