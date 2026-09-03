import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { SessionUser } from "@clip/types";

/** Reads the authenticated session user attached by JwtAuthGuard. */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): SessionUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
