import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { UserRole, SessionUser } from "@clip/types";

/**
 * Checks the authenticated user's role against a route's @Roles(...) list.
 * Runs after JwtAuthGuard. Object-level ownership checks (does this user own
 * this specific campaign/wallet?) still happen in the service layer — a role
 * match here is necessary but not sufficient. See docs/api/API_AUTHORIZATION.md.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: SessionUser | undefined = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "Insufficient permissions." });
    }

    return true;
  }
}
