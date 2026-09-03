import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateOnboardingStatusDto {
  @IsString()
  step!: string;

  @IsOptional()
  @IsBoolean()
  complete?: boolean;
}
