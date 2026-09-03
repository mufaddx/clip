import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@clip/types";

export const ROLES_KEY = "roles";

/**
 * Declares which roles may call this route — enforced by RolesGuard.
 * See docs/api/API_AUTHORIZATION.md.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
