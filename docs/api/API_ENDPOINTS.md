# API Endpoints

## Purpose

High-level endpoint inventory by module. Full request/response shapes live as OpenAPI annotations in code (see [`API_ARCHITECTURE.md`](API_ARCHITECTURE.md)) — this document is the map of what exists and who can call it, kept current as modules are implemented.

## `/v1/auth`

`POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `POST /forgot-password`, `POST /reset-password`, `POST /verify-email`. Public (unauthenticated) except `/refresh` and `/logout` which require a valid refresh/access token.

## `/v1/users`

`GET /me`, `PATCH /me`, `GET /me/onboarding-status`, `PATCH /me/onboarding-status`. Requires authentication; scoped to the caller only.

## `/v1/brands`

`GET /:id`, `PATCH /:id`, `GET /:id/team`, `POST /:id/team/invite`, `PATCH /:id/team/:memberId`, `DELETE /:id/team/:memberId`. Requires `BRAND_OWNER`/`BRAND_TEAM_MEMBER` with object-level ownership check.

## `/v1/clippers`

`GET /:id`, `PATCH /:id`, `GET /:id/trust-score`. Requires `CLIPPER` (self) or admin roles.

## `/v1/campaigns`

`GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `POST /:id/submit`, `POST /:id/fund`, `POST /:id/pause`, `POST /:id/resume`, `POST /:id/cancel`, `POST /:id/accept` (clipper), `GET /:id/creators`, `GET /recommended` (clipper). Role/permission-gated per action — see [`API_AUTHORIZATION.md`](API_AUTHORIZATION.md).

## `/v1/instagram`

`GET /oauth/start`, `GET /oauth/callback`, `GET /accounts`, `DELETE /accounts/:id`, `GET /accounts/:id/insights`. See [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md).

## `/v1/reels`

`POST /submit`, `GET /:id`, `GET /:id/verification`. Clipper-scoped for creation; brand/admin read access scoped to campaigns they own/manage.

## `/v1/metrics`

`GET /reels/:id/snapshots`, `GET /reels/:id/latest`. Read-only, scoped by campaign ownership.

## `/v1/performance`

`GET /reels/:id/calculations`, `GET /rules`, `PATCH /rules` (admin only — creates a new version, see [`../performance/PERFORMANCE_SCORING.md`](../performance/PERFORMANCE_SCORING.md)).

## `/v1/wallet`

`GET /`, `GET /ledger`, `POST /deposits`, `POST /withdrawals`, `GET /withdrawals`, `POST /refunds` (admin/finance-admin only for issuing).

## `/v1/referrals`

`GET /me`, `GET /me/rewards`, `GET /rules` (public, informational), `PATCH /rules` (admin only).

## `/v1/admin`

`GET /users`, `PATCH /users/:id/status`, `GET /audit-logs`, `GET /disputes`, `PATCH /disputes/:id`, `GET /support-tickets`, `PATCH /support-tickets/:id`, plus admin-scoped variants of the resource endpoints above for cross-tenant visibility.

## Related documents

[`API_ARCHITECTURE.md`](API_ARCHITECTURE.md), [`API_AUTHORIZATION.md`](API_AUTHORIZATION.md), [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md).
