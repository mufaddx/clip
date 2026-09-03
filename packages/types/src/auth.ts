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

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
