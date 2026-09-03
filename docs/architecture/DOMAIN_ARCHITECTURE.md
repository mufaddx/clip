# Domain Architecture

## Purpose

Defines the subdomain layout, the environment-variable indirection that keeps the real production domain out of source code, and local-development equivalents.

## Domains

| Purpose | Placeholder domain | Env var |
|---|---|---|
| Public marketing + auth | `domain.in` (+ `www.domain.in`) | `PUBLIC_APP_URL` |
| Clipper dashboard | `clipper.domain.in` | `CLIPPER_APP_URL` |
| Brand dashboard | `brand.domain.in` | `BRAND_APP_URL` |
| Super Admin portal | `admin.domain.in` | `ADMIN_APP_URL` |
| Backend API | `api.domain.in` | `API_URL` |

`PRIMARY_DOMAIN` is the single value that changes when moving from the placeholder to a real production domain — every other URL is derived from it in deployment config, not hardcoded per-app. Application code never contains a literal `domain.in`; it always reads from `process.env.*_APP_URL` / `NEXT_PUBLIC_*_APP_URL`.

## Why role-specific subdomains instead of one app

- Clean separation of bundle size, auth surface, and navigation per audience — a clipper never ships brand-only code and vice versa.
- Independent deploy/scale per app; admin can be locked down (IP allowlist, stricter CSP) without affecting the other three.
- `app.domain.in` is deliberately **not** used as a shared dashboard — each role gets its own subdomain identity, which is also clearer for cookie/session scoping.

## Local development equivalents

Real wildcard subdomains aren't available on `localhost` without extra setup, so local dev uses:

| App | Local URL |
|---|---|
| public-web | `http://localhost:3000` |
| clipper-app | `http://localhost:3001` |
| brand-app | `http://localhost:3002` |
| admin-app | `http://localhost:3003` |
| api | `http://localhost:4000` |

For testing real cross-subdomain cookie behavior locally, map `clipper.localhost`, `brand.localhost`, `admin.localhost`, and `localhost` to `127.0.0.1` (most OSes resolve `*.localhost` to loopback automatically) and run each app on its assigned port behind those hostnames — see [`../deployment/DOMAIN_DEPLOYMENT.md`](../deployment/DOMAIN_DEPLOYMENT.md) for the full local + production setup.

## Public routes (domain.in)

`/`, `/about`, `/how-it-works`, `/for-brands`, `/for-clippers`, `/categories`, `/pricing`, `/faq`, `/contact`, `/privacy`, `/terms`, `/login`, `/signup`.

The public site never renders the full internal dashboard — after login it redirects out to the role's subdomain (see [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md)).

## Routing enforcement

- Each Next.js app's middleware checks the session's role claim against that app's allowed roles; a mismatch returns a 403 page with a link to the correct app's URL (read from env, never hardcoded).
- The API independently checks role/permission on every request — the frontend check is UX only. See [`SECURITY_ARCHITECTURE.md`](SECURITY_ARCHITECTURE.md).

## Related documents

[`../deployment/DOMAIN_DEPLOYMENT.md`](../deployment/DOMAIN_DEPLOYMENT.md), [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md), [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md).
