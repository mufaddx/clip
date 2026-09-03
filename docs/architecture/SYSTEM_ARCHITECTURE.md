# System Architecture

## Purpose

High-level map of every moving part in CLIP and how they talk to each other. Read this first, then drill into the domain-specific architecture docs it links to.

## Topology

```
                         ┌───────────────────────┐
                         │   Users (browsers)    │
                         └───────────┬───────────┘
              ┌────────────┬─────────┼─────────┬────────────┐
              ▼            ▼         ▼         ▼             ▼
        domain.in   clipper.domain.in  brand.domain.in  admin.domain.in
       (public-web)     (clipper-app)     (brand-app)      (admin-app)
        Next.js App Router · SSR + client islands · shared @clip/ui
              └────────────┴─────────┼─────────┴────────────┘
                                      ▼
                          api.domain.in  (apps/api — NestJS)
                    REST, versioned /v1, RBAC guards, DTO validation
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      PostgreSQL (Prisma)       Redis (BullMQ)         Meta Graph API
      source of truth           background jobs        Instagram data
```

## Applications

| App | Package | Domain | Framework |
|---|---|---|---|
| Public website | `apps/public-web` | `domain.in` | Next.js (App Router) |
| Clipper app | `apps/clipper-app` | `clipper.domain.in` | Next.js (App Router) |
| Brand app | `apps/brand-app` | `brand.domain.in` | Next.js (App Router) |
| Admin app | `apps/admin-app` | `admin.domain.in` | Next.js (App Router) |
| Backend API | `apps/api` | `api.domain.in` | NestJS |

Shared code lives in `packages/*` (`ui`, `config`, `types`, `utilities`, `db`) — see [`FRONTEND_ARCHITECTURE.md`](FRONTEND_ARCHITECTURE.md) and [`../development/FOLDER_STRUCTURE.md`](../development/FOLDER_STRUCTURE.md).

## Data flow principles

1. **Frontends never talk to the database directly.** Every read/write goes through `apps/api`. The one exception is `packages/db` being imported by the API service itself and by background workers — never by a Next.js app.
2. **All four frontends are equally "thin."** Business logic (campaign rules, performance formulas, ledger math) lives in the API's service layer, not in React components or route handlers.
3. **Background workers share the same `packages/db` and service layer as the API** where practical, so a rule enforced in a synchronous endpoint is enforced identically in an async job.
4. **The Meta/Instagram integration is isolated** behind its own module (`apps/api/src/modules/instagram`) — nothing else in the codebase calls the Graph API directly. See [`META_INSTAGRAM_INTEGRATION.md`](META_INSTAGRAM_INTEGRATION.md).

## Cross-cutting concerns

- **Authentication**: JWT access + refresh tokens, shared-domain cookie, verified on every API request — see [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md) and [`SECURITY_ARCHITECTURE.md`](SECURITY_ARCHITECTURE.md).
- **Authorization**: role/permission guards on every API route — see [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md).
- **Background processing**: BullMQ workers for anything that shouldn't block a request — see [`BACKGROUND_JOBS.md`](BACKGROUND_JOBS.md).
- **Observability**: structured logs from the API and workers, audit logs for admin actions (see [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md)).

## Related documents

[`DOMAIN_ARCHITECTURE.md`](DOMAIN_ARCHITECTURE.md), [`APPLICATION_ARCHITECTURE.md`](APPLICATION_ARCHITECTURE.md), [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md), [`FRONTEND_ARCHITECTURE.md`](FRONTEND_ARCHITECTURE.md), [`SECURITY_ARCHITECTURE.md`](SECURITY_ARCHITECTURE.md), [`SCALABILITY_ARCHITECTURE.md`](SCALABILITY_ARCHITECTURE.md).
