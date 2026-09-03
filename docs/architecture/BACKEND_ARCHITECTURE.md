# Backend Architecture

## Purpose

Describes `apps/api` internal structure, module boundaries, and the layering rules that keep business logic centralized and testable.

## Framework & layering

NestJS, TypeScript, one module per bounded context under `apps/api/src/modules/*`. Standard layering inside each module:

```
modules/<name>/
  <name>.controller.ts   HTTP routing + DTO validation only
  <name>.service.ts      business logic — the only layer allowed to call @clip/db
  <name>.module.ts        wiring
  dto/                    request/response DTOs (class-validator decorated)
  entities/                internal domain types, if distinct from Prisma models
```

## Module list (v1)

`auth`, `users`, `brands`, `clippers`, `team-members`, `campaigns`, `campaign-reels`, `instagram`, `metrics`, `performance`, `wallet`, `payments`, `withdrawals`, `referrals`, `notifications`, `support`, `disputes`, `admin`, `audit`.

## Layering rules

1. **Controllers stay thin.** They validate the request shape (via DTOs + `class-validator`), call exactly one service method, and shape the response. No conditionals encoding business rules belong here.
2. **Services own business logic and are the only place `@clip/db` (Prisma) is imported.** A service method is the unit both HTTP controllers and BullMQ workers call — this is what keeps "an endpoint enforces a rule but the matching worker doesn't" from happening.
3. **Guards enforce authorization before a controller method runs** — `JwtAuthGuard` (is this a valid session?) then a `RolesGuard`/`PermissionsGuard` (is this role/permission allowed?). See [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md).
4. **Financial mutations are transactional.** Any service method that touches `wallets`/`wallet_ledger` wraps its reads+writes in a single Prisma transaction to prevent race conditions (e.g., two concurrent withdrawal requests over-debiting a balance).
5. **External integrations are adapters.** The `instagram` module exposes a narrow internal interface (`getAccountInsights`, `exchangeToken`, `verifyMedia`, …); nothing else in the codebase imports the Meta SDK/HTTP client directly. See [`META_INSTAGRAM_INTEGRATION.md`](META_INSTAGRAM_INTEGRATION.md).

## Request lifecycle

```
HTTP request → api.domain.in
  → Helmet + CORS + rate limiter (global middleware)
  → JwtAuthGuard (verifies access token, attaches req.user)
  → RolesGuard / PermissionsGuard (checks role/permission for this route)
  → ValidationPipe (DTO validation, whitelist unknown fields away)
  → Controller → Service → @clip/db (Prisma) → PostgreSQL
  → Response DTO (never a raw Prisma model — strips internal-only fields)
```

## Error handling

A global exception filter maps known error classes to a consistent shape:

```json
{ "error": { "code": "CAMPAIGN_NOT_FUNDED", "message": "...", "details": {} } }
```

Business-rule violations throw typed exceptions (`DomainException` subclasses) rather than generic errors, so the frontend can branch on `error.code` instead of parsing message strings.

## Related documents

[`../api/API_ARCHITECTURE.md`](../api/API_ARCHITECTURE.md), [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md), [`BACKGROUND_JOBS.md`](BACKGROUND_JOBS.md), [`SECURITY_ARCHITECTURE.md`](SECURITY_ARCHITECTURE.md).
