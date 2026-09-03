import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ACCESS_TOKEN_COOKIE } from "../constants";
import type { SessionUser } from "@clip/types";

/**
 * Verifies the access token from the shared session cookie and attaches
 * `request.user`. Applied globally; a route opts out via @Public().
 * This is the actual security boundary — see docs/architecture/SECURITY_ARCHITECTURE.md
 * ("frontend role checks are UX only").
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "No session found." });
    }

    try {
      const payload = await this.jwtService.verifyAsync<SessionUser>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({ code: "TOKEN_EXPIRED", message: "Session expired." });
    }
  }
}
