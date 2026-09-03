import { IsInt, IsOptional, IsString, Min } from "class-validator";

/**
 * Dev/staging-only stand-in for the real Metrics Sync Worker pulling from
 * the Graph API — see docs/architecture/META_INSTAGRAM_INTEGRATION.md and
 * docs/performance/METRICS_ARCHITECTURE.md. Lets the qualified-performance
 * pipeline be exercised end-to-end before that integration exists.
 */
export class RecordSnapshotDto {
  @IsString()
  reelId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  views?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reach?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  likes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  comments?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shares?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  saves?: number;
}
