# Application Architecture

## Purpose

Describes how the five applications are structured internally and how they share code without copy-pasting components across apps.

## Monorepo layout

```
apps/
  public-web/     Next.js — marketing + auth (domain.in)
  clipper-app/    Next.js — creator dashboard (clipper.domain.in)
  brand-app/      Next.js — brand dashboard (brand.domain.in)
  admin-app/      Next.js — admin portal (admin.domain.in)
  api/            NestJS — backend API (api.domain.in)
packages/
  ui/             Shared design-system components (@clip/ui)
  config/         Shared eslint/tailwind/tsconfig presets, env schema (@clip/config)
  types/          Shared TypeScript types/DTOs used by both frontend and API (@clip/types)
  utilities/      Shared pure functions: currency, date, validation helpers (@clip/utilities)
  db/             Prisma schema + generated client + query helpers (@clip/db) — imported only by apps/api and workers
```

Managed with **pnpm workspaces** + **Turborepo** for task orchestration/caching. See [`../development/FOLDER_STRUCTURE.md`](../development/FOLDER_STRUCTURE.md) for the full file tree convention inside each app.

## Why this split

- `packages/ui` guarantees the sidebar, buttons, tables, cards, and charts look and behave identically across clipper/brand/admin — see [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md).
- `packages/types` is the contract between frontend and backend — a DTO defined once, imported by both sides, so a shape change is a single-file diff instead of three.
- `packages/db` isolates all database access to server-side code (API + workers). No Next.js app ever imports `@clip/db` directly, even in a Server Component, so there is exactly one code path that touches Postgres and exactly one place authorization must be enforced for data access.

## Each Next.js app, internally

- App Router (`src/app`), route groups per section (`(public)`, `(auth)`, `(dashboard)`).
- Server Components by default; Client Components only where interactivity requires it (forms, charts with client-side interaction, modals).
- Data fetching goes through a thin typed API client (`src/lib/api-client.ts`) built on `@clip/types` DTOs, never ad-hoc `fetch` calls scattered through components.
- `middleware.ts` handles the session-check + role redirect described in [`DOMAIN_ARCHITECTURE.md`](DOMAIN_ARCHITECTURE.md).

## The API app, internally

- NestJS modules per bounded context (`auth`, `users`, `campaigns`, `instagram`, `reels`, `metrics`, `performance`, `wallet`, `referrals`, `admin`, `notifications`), each with `controller / service / dto / entities`.
- Controllers only validate input (DTO) and delegate; all business logic lives in services, so workers can call the same services the HTTP layer calls.
- See [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md) for the full module breakdown.

## Related documents

[`FRONTEND_ARCHITECTURE.md`](FRONTEND_ARCHITECTURE.md), [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md), [`../development/FOLDER_STRUCTURE.md`](../development/FOLDER_STRUCTURE.md).
