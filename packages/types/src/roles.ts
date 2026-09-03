/**
 * Role contract shared between the API and every frontend.
 * See docs/product/USER_ROLES.md.
 */
export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
  "FINANCE_ADMIN",
  "BRAND_OWNER",
  "BRAND_TEAM_MEMBER",
  "CLIPPER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
  "FINANCE_ADMIN",
];

export const BRAND_ROLES: readonly UserRole[] = ["BRAND_OWNER", "BRAND_TEAM_MEMBER"];

export const CLIPPER_ROLES: readonly UserRole[] = ["CLIPPER"];

/**
 * Which app a role lands in after login — see
 * docs/users/AUTHENTICATION_FLOW.md "Role → redirect".
 */
export function appForRole(role: UserRole): "admin" | "brand" | "clipper" {
  if (ADMIN_ROLES.includes(role)) return "admin";
  if (BRAND_ROLES.includes(role)) return "brand";
  return "clipper";
}

export const TEAM_PERMISSIONS = [
  "CAMPAIGNS_VIEW",
  "CAMPAIGNS_CREATE",
  "CAMPAIGNS_EDIT",
  "CAMPAIGNS_APPROVE_BUDGET",
  "ANALYTICS_VIEW",
  "REPORTS_VIEW",
  "WALLET_VIEW",
  "TEAM_INVITE",
] as const;

export type TeamPermission = (typeof TEAM_PERMISSIONS)[number];
