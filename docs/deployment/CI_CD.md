# CI/CD

## Purpose

The automated pipeline that takes a commit from PR to Production, gating on the tests defined in [`../development/TESTING_STRATEGY.md`](../development/TESTING_STRATEGY.md) and the migration rules in [`../database/MIGRATION_STRATEGY.md`](../database/MIGRATION_STRATEGY.md).

## Pipeline stages

```
PR opened
  → Install (pnpm install, cached)
  → Typecheck (turbo run typecheck)
  → Lint (turbo run lint)
  → Unit + Integration + API tests (turbo run test, against an ephemeral test Postgres/Redis)
  → Migration check: `prisma migrate deploy --dry-run` against a fresh schema, catching
    a migration that fails to apply cleanly before it ever reaches Staging
  → Build (turbo run build, all 5 units)
  → Preview deployment (all 5 units) posted back to the PR
  → Human review + approval
merge to main
  → Same pipeline re-run against main
  → Automatic deploy to Staging (apps + `prisma migrate deploy`)
  → Manual verification on Staging
  → Manual approval gate
  → Deploy to Production (apps + `prisma migrate deploy`), released in order:
      1. API (HTTP + worker) — backward-compatible with the currently-live frontends
      2. All four frontends
    (never frontends before the API, to avoid a frontend calling an endpoint shape
    the currently-live API doesn't yet support)
```

## Turborepo caching

`turbo.json` scopes build/test task caching by content hash — an unrelated change to `admin-app` doesn't invalidate `api`'s test cache, keeping CI fast as the monorepo grows.

## Rollback

A failed Production deploy (health check failure post-deploy) triggers an automatic rollback to the previous release for the app tier that failed; a migration that has already applied and needs reverting follows the additive-first strategy in [`../database/MIGRATION_STRATEGY.md`](../database/MIGRATION_STRATEGY.md) — a schema rollback is a new forward migration, not a destructive revert of the applied one.

## Secrets in CI

CI-only credentials (test database URL, ephemeral Redis) are distinct from any real environment's secrets and are provisioned fresh per run — no shared long-lived test credentials that could leak into a real environment's configuration.

## Related documents

[`../deployment/DEPLOYMENT_ARCHITECTURE.md`](../deployment/DEPLOYMENT_ARCHITECTURE.md), [`../deployment/ENVIRONMENT_STRATEGY.md`](../deployment/ENVIRONMENT_STRATEGY.md), [`../development/TESTING_STRATEGY.md`](../development/TESTING_STRATEGY.md), [`../database/MIGRATION_STRATEGY.md`](../database/MIGRATION_STRATEGY.md).
