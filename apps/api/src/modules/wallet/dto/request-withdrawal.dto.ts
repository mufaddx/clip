import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class RequestWithdrawalDto {
  /** Minor units — see docs/database/DATABASE_SCHEMA.md money conventions. */
  @IsInt()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  payoutMethod?: string;
}
