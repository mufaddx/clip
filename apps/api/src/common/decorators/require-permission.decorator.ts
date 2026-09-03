import { SetMetadata } from "@nestjs/common";
import type { TeamPermission } from "@clip/db";

export const REQUIRE_PERMISSION_KEY = "requirePermission";

/**
 * Declares a brand-team permission required on top of the role check — see
 * docs/product/USER_ROLES.md "Brand team member permission scopes" and
 * docs/api/API_AUTHORIZATION.md. A BRAND_OWNER always passes (owners hold
 * every permission implicitly); a BRAND_TEAM_MEMBER must have this
 * permission on their TeamMember row.
 */
export const RequirePermission = (permission: TeamPermission) => SetMetadata(REQUIRE_PERMISSION_KEY, permission);
