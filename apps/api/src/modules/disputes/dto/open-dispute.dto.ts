import { IsIn, IsString, MinLength } from "class-validator";
import type { DisputeType } from "@clip/db";

const TYPES: DisputeType[] = ["CAMPAIGN", "PERFORMANCE", "PAYMENT", "VERIFICATION"];

export class OpenDisputeDto {
  @IsIn(TYPES)
  type!: DisputeType;

  /** e.g. "campaign", "campaign_reel", "payment" — see docs/database/DATABASE_RELATIONSHIPS.md. */
  @IsString()
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}
