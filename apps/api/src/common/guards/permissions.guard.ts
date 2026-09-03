import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { prisma, type TeamPermission } from "@clip/db";
import type { SessionUser } from "@clip/types";
import { REQUIRE_PERMISSION_KEY } from "../decorators/require-permission.decorator";

/**
 * Runs after RolesGuard. See docs/product/USER_ROLES.md "Brand team member
 * permission scopes" — a BRAND_TEAM_MEMBER without the declared permission
 * can reach the route (role-wise) but is rejected here; a BRAND_OWNER
 * always passes.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<TeamPermission>(REQUIRE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user: SessionUser | undefined = request.user;
    if (!user) return false;
    if (user.role !== "BRAND_TEAM_MEMBER") return true; // owners and non-brand roles aren't scoped by TeamMember rows

    const member = await prisma.teamMember.findFirst({ where: { userId: user.id, removedAt: null } });

    if (!member || !member.permissions.includes(required)) {
      throw new ForbiddenException({
        code: "MISSING_PERMISSION",
        message: `This action requires the ${required} permission.`,
      });
    }

    return true;
  }
}
