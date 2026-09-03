/**
 * Cookie names for the shared cross-subdomain session — see
 * docs/users/AUTHENTICATION_FLOW.md and docs/architecture/SECURITY_ARCHITECTURE.md.
 * Both are HttpOnly, Secure (prod), SameSite=Lax, scoped to AUTH_COOKIE_DOMAIN.
 */
export const ACCESS_TOKEN_COOKIE = "clip_access_token";
export const REFRESH_TOKEN_COOKIE = "clip_refresh_token";
