# Migration Strategy

## Purpose

How schema changes are made safely as CLIP evolves, using Prisma Migrate as the single mechanism for schema change — no manual DDL against any environment beyond local experimentation.

## Tooling

`packages/db/prisma/schema.prisma` is the single source of schema truth. Changes flow: edit schema → `pnpm db:migrate` (wraps `prisma migrate dev`) generates a timestamped migration under `packages/db/prisma/migrations/` → committed to git alongside the schema change → applied to staging/production via `prisma migrate deploy` in the CI/CD pipeline (see [`../deployment/CI_CD.md`](../deployment/CI_CD.md)).

## Rules

1. **Never edit a migration that has already been applied to a shared environment.** A mistake is fixed with a new forward migration, not a rewrite of history — rewriting history breaks anyone else's local migration state and staging/production drift detection.
2. **Every migration that changes a financial table (`wallets`, `wallet_ledger`, `payments`, `withdrawals`, `refunds`) is reviewed with extra scrutiny** — a backward-incompatible change here risks data integrity in a way a marketing-page table change doesn't.
3. **Additive-first for breaking changes.** Renaming/removing a column used in production code ships as: add new column → dual-write in application code → backfill → cut reads over → remove old column in a later migration — not a single destructive rename in one deploy.
4. **Destructive operations (`DROP COLUMN`, `DROP TABLE`) require an explicit backup checkpoint noted in the PR** before being applied to production.
5. **Seed data** (`packages/db/prisma/seed.ts`) covers categories, default `performance_rules`/`referral_rules` versions, and role/permission definitions — enough for a fresh environment to be functional, never fake user/financial data outside local dev.

## Environments

| Environment | Migration command | Notes |
|---|---|---|
| Local dev | `prisma migrate dev` | Creates + applies migrations, regenerates client |
| CI (test run) | `prisma migrate deploy` against an ephemeral test database | Verifies migrations apply cleanly before merge |
| Staging | `prisma migrate deploy` | Automatic on deploy to staging |
| Production | `prisma migrate deploy` | Gated behind a manual approval step in CI/CD |

## Related documents

[`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md), [`../deployment/CI_CD.md`](../deployment/CI_CD.md), [`../development/ENVIRONMENT_SETUP.md`](../development/ENVIRONMENT_SETUP.md).
