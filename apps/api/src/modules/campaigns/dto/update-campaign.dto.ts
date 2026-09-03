import { PartialType } from "@nestjs/mapped-types";
import { CreateCampaignDto } from "./create-campaign.dto";

// A DRAFT campaign can be edited freely; once SUBMITTED, edits are blocked
// server-side — see docs/campaigns/CAMPAIGN_RULES.md.
export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
