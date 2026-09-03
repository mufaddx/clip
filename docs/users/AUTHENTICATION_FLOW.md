# Authentication Flow

## Purpose

Defines login, session, and cross-subdomain authentication mechanics. This is the flow implemented first in code (see [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md) for the security requirements it must satisfy).

## Login flow

```
User visits domain.in/login
  → Submits email + password
  → POST api.domain.in/v1/auth/login
  → API verifies: identity (password hash match) + account status (not suspended) + email verified
  → API issues access token (JWT, 15m) + refresh token (30d, stored hashed)
  → Tokens set as HttpOnly cookies scoped to AUTH_COOKIE_DOMAIN (shared parent domain)
  → API response includes the user's role
  → Frontend redirects based on role (see table below)
```

## Role → redirect

| Role | Redirect target |
|---|---|
| `BRAND_OWNER`, `BRAND_TEAM_MEMBER` | `BRAND_APP_URL/dashboard` |
| `CLIPPER` | `CLIPPER_APP_URL/dashboard` |
| `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `FINANCE_ADMIN` | `ADMIN_APP_URL/dashboard` |

If onboarding is incomplete for the role, the redirect target is the onboarding wizard's next incomplete step instead of the dashboard (see [`ONBOARDING_FLOW.md`](ONBOARDING_FLOW.md)).

## Cross-subdomain session

The session cookie's `Domain` attribute is the shared parent (`.domain.in` in production; see [`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md) for the local-dev equivalent), so a session established at `domain.in/login` is automatically valid when the browser is redirected to `clipper.domain.in`, `brand.domain.in`, or `admin.domain.in` — no second login step.

## Unauthorized cross-app access

If a `CLIPPER` session reaches `brand.domain.in` (typed URL, stale bookmark, etc.):

1. That app's `middleware.ts` checks the session's role claim against its allowed roles.
2. Mismatch → render a 403 page explaining the app is for brands, with a link (built from `CLIPPER_APP_URL` env var, never hardcoded) back to the clipper app.
3. **The API independently re-checks role/permission on every request** — the frontend redirect is a UX convenience, not the security boundary; a request that somehow reaches the API without going through the frontend gate is still rejected server-side.

## Token refresh

Access token expiry is handled transparently: the API client detects a 401 with `code: TOKEN_EXPIRED`, calls `/v1/auth/refresh` using the refresh cookie, and retries the original request once. A failed refresh (expired/revoked refresh token) clears session cookies and redirects to `/login`.

## Logout

Clears both cookies via the API (`/v1/auth/logout`, which also invalidates the stored refresh token hash server-side) and redirects to `domain.in`.

## Password reset

```
/forgot-password → email submitted → API issues a signed, time-limited reset token, emails a link
  → /reset-password?token=... → new password submitted → API verifies token + expiry → password updated → all existing refresh tokens for the account revoked
```

## Related documents

[`ONBOARDING_FLOW.md`](ONBOARDING_FLOW.md), [`../product/USER_ROLES.md`](../product/USER_ROLES.md), [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md), [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md).
