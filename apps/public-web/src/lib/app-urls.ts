import { appForRole, type UserRole } from "@clip/types";

/**
 * Maps a role to its app's base URL, read from env — never hardcode a
 * domain in application code. See docs/architecture/DOMAIN_ARCHITECTURE.md.
 */
export function appUrlForRole(role: UserRole): string {
  switch (appForRole(role)) {
    case "admin":
      return process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://localhost:3003";
    case "brand":
      return process.env.NEXT_PUBLIC_BRAND_APP_URL ?? "http://localhost:3002";
    case "clipper":
      return process.env.NEXT_PUBLIC_CLIPPER_APP_URL ?? "http://localhost:3001";
  }
}
