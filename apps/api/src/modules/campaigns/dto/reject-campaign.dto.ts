import { IsString, MinLength } from "class-validator";

// Rejection always carries a reason, persisted and shown to the brand —
// see docs/campaigns/CAMPAIGN_LIFECYCLE.md.
export class RejectCampaignDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}
