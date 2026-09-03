import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marks a route as not requiring authentication (e.g. login, signup).
 * JwtAuthGuard is applied globally except on routes carrying this decorator —
 * see docs/architecture/BACKEND_ARCHITECTURE.md "Request lifecycle".
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
