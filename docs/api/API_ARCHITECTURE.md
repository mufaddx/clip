# API Architecture

## Purpose

`apps/api` (NestJS) is the single backend all four frontends and all background workers talk through. This document covers REST conventions; module/layering details live in [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md).

## Base URL & versioning

`api.domain.in/v1/*` — all routes are versioned under `/v1` from day one so a future breaking change ships as `/v2` alongside it rather than a disruptive in-place change.

## Conventions

- **Pagination**: cursor or offset-based (`?page=1&pageSize=20`), response includes `{ data, meta: { page, pageSize, total } }`.
- **Filtering**: query params scoped to the resource (e.g. `GET /v1/campaigns?status=LIVE&category=beauty`), validated against an allowed filter list per endpoint — unknown filters are rejected, not silently ignored.
- **Sorting**: `?sortBy=createdAt&sortDir=desc`, allowlisted sortable fields per endpoint.
- **Response envelope**: success responses return the resource/collection directly (with the pagination `meta` wrapper for collections); errors always use the shape `{ error: { code, message, details } }` (see [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md) error handling).
- **DTO validation**: every request body/query validated via `class-validator` DTOs with a whitelist `ValidationPipe` — unknown fields stripped, invalid fields rejected with field-level error detail.
- **Idempotency**: mutating endpoints that could be retried by a client (e.g. campaign funding, withdrawal requests) accept an optional `Idempotency-Key` header, deduplicated server-side.

## Authentication on every request

`Authorization` is carried via the shared session cookie (see [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md)) for browser-originated requests; a future public partner API (out of scope for v1, see [`../product/PLATFORM_FEATURES.md`](../product/PLATFORM_FEATURES.md)) would use API keys instead, on a distinct `/v1/partner/*` namespace, never mixed with the cookie-authenticated routes.

## Documentation

The API is self-documented via OpenAPI (NestJS's `@nestjs/swagger` decorators on every controller/DTO), served at `api.domain.in/v1/docs` in non-production environments only.

## Related documents

[`API_ENDPOINTS.md`](API_ENDPOINTS.md), [`API_AUTHORIZATION.md`](API_AUTHORIZATION.md), [`WEBHOOKS.md`](WEBHOOKS.md), [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md).
