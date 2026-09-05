import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
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

  @IsOptional()
  @IsIn(OBJECTIVES)
  objective?: CampaignObjective;

  /**
   * Minor units — the creator budget pool, before platform fee. Optional
   * because it's usually derived from maxParticipants × the platform's
   * per-account rate instead of being typed in directly — see
   * CampaignsService.createDraft. Still accepted directly for flexibility;
   * the service rejects a request that gives neither.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorBudget?: number;

  /** How many days this campaign should stay LIVE — informational only for now. */
  @IsOptional()
  @IsInt()
  @IsPositive()
  durationDays?: number;

  /**
   * The number of clipper slots being bought — views per account vary too
   * much to price by view count, so this (not a view target) is what
   * creatorBudget is derived from, and it's still the hard cap on
   * acceptances — see CampaignsService.
   */
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
  // https-only, real protocol required — this URL later gets fetched
  // server-side (MediaFingerprintService, for content-match verification),
  // so a bare string here was an SSRF hole: nothing stopped a brand from
  // pointing it at an internal address. This blocks the obviously-wrong
  // shapes (file://, bare IPs without a scheme, etc.); MediaFingerprintService
  // itself still checks the resolved IP isn't private/internal before
  // fetching, since a syntactically valid https:// URL can still resolve
  // to an internal address.
  @IsUrl({ protocols: ["https"], require_protocol: true })
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
