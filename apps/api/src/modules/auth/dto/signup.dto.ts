import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import type { SignupRoleChoice } from "@clip/types";

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // First onboarding question — "How do you want to use CLIP?" — see
  // docs/users/ONBOARDING_FLOW.md. Irreversible by the user afterward.
  @IsIn(["BRAND", "CLIPPER"])
  roleChoice!: SignupRoleChoice;

  @IsOptional()
  @IsString()
  referralCode?: string;
}
