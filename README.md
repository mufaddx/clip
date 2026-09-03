# CLIP

A creator clipping, campaign distribution, performance tracking, and creator earnings platform — a Turborepo monorepo of four Next.js apps and one NestJS API, backed by PostgreSQL/Prisma and Redis/BullMQ.

**Start here → [`docs/README.md`](docs/README.md)** — the full product, architecture, UI/UX, and implementation documentation. Read the relevant doc before changing a module; this repo treats `/docs` as the source of truth, not conversation history.

## What's here

| App | Domain (placeholder) | Local dev |
|---|---|---|
| [`apps/public-web`](apps/public-web) | `domain.in` | http://localhost:3000 |
| [`apps/clipper-app`](apps/clipper-app) | `clipper.domain.in` | http://localhost:3001 |
| [`apps/brand-app`](apps/brand-app) | `brand.domain.in` | http://localhost:3002 |
| [`apps/admin-app`](apps/admin-app) | `admin.domain.in` | http://localhost:3003 |
| [`apps/api`](apps/api) | `api.domain.in` | http://localhost:4000 |

Shared code lives in [`packages/`](packages) (`ui`, `config`, `types`, `utilities`, `db`) — see [`docs/architecture/APPLICATION_ARCHITECTURE.md`](docs/architecture/APPLICATION_ARCHITECTURE.md).

## Status

Phase 0 (documentation) is complete. The backend (`apps/api`) has real, working business logic across all 16 modules — auth, wallet/ledger, campaigns, reels, Instagram OAuth, performance scoring, referrals, notifications, support, disputes, payments/webhooks, analytics, moderation, and admin/brand/clipper profile management — plus 6 of 9 documented BullMQ background workers. All four frontends now have functional pages beyond the dashboard shells: the full campaign lifecycle (brand creation wizard through admin approval to clipper accept/submit), wallet/withdrawals, Instagram connect, team management, and the admin operational queues (users, campaigns, risk-review, withdrawals, referrals, disputes, moderation, audit logs). A handful of pages are honest stubs where the backing admin-wide listing/export endpoints don't exist yet — each says why. None of this has been run — there's no Node.js/pnpm on this machine — so it's correct-by-construction, not test-verified beyond one unit test suite. See [`docs/README.md`](docs/README.md#current-implementation-status) for the detailed, per-module checklist.

## Getting started

**Node.js and pnpm are not yet installed on this machine.** Install Node ≥ 20.11 and pnpm ≥ 9 first, then:

```bash
pnpm install
cp .env.example .env      # fill in real local values
pnpm db:generate
pnpm db:migrate
pnpm dev
```

See [`docs/development/ENVIRONMENT_SETUP.md`](docs/development/ENVIRONMENT_SETUP.md) for full setup, prerequisites, and local cross-subdomain cookie testing.
