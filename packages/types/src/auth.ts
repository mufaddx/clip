import type { UserRole } from "./roles";

/** Decoded shape of the access token payload — see docs/users/AUTHENTICATION_FLOW.md. */
export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  onboardingComplete: boolean;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: SessionUser;
  /** Where the frontend should redirect to next — dashboard or onboarding. */
  redirectTo: string;
}

export type SignupRoleChoice = "BRAND" | "CLIPPER";

export interface SignupRequestDto {
  email: string;
  password: string;
  roleChoice: SignupRoleChoice;
  referralCode?: string;
}

/** register() no longer issues a session directly — see
 * docs/users/AUTHENTICATION_FLOW.md "Email verification". It creates the
 * account and emails a 6-digit code; the frontend moves to an OTP-entry
 * step and only gets a real session (LoginResponseDto) from verifyEmail(). */
export interface RegisterResponseDto {
  email: string;
  requiresVerification: true;
}

export interface VerifyEmailRequestDto {
  email: string;
  code: string;
}

export interface ResendVerificationRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
