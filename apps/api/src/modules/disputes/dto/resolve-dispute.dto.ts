import { IsBoolean, IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

// A financial reversal (creatorUserId + reelId + amount) requires
// FINANCE_ADMIN/SUPER_ADMIN — see docs/finance/REFUND_SYSTEM.md
// "Dispute-driven reversal". Omit it for a non-financial resolution.
export class ResolveDisputeDto {
  @IsBoolean()
  upheld!: boolean;

  @IsString()
  @MinLength(1)
  resolution!: string;

  @IsOptional()
  @IsString()
  reversalCreatorUserId?: string;

  @IsOptional()
  @IsString()
  reversalReelId?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  reversalAmount?: number;
}
