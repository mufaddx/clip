# Environment Setup

## Prerequisites

- **Node.js** ≥ 20.11 (LTS) — install before running any `pnpm` command, OR see "No native Node.js install" below to run everything through Docker instead.
- **pnpm** ≥ 9 (`corepack enable` then `corepack prepare pnpm@9.1.0 --activate`, or install directly).
- **PostgreSQL** ≥ 15 (local `docker-compose.yml`, a managed instance like Supabase, or a native install).
- **Redis** ≥ 7 (local `docker-compose.yml` or a native install; required for BullMQ workers).

### No native Node.js install? Use Docker

Every `pnpm`/`prisma` command in this doc also works with zero native Node.js install, by running it inside a `node:20` container with the repo mounted:

```bash
docker compose up -d   # postgres + redis, per docker-compose.yml
docker run --rm -v "<repo-path>:/app" -w /app --network clip_default \
  -e DATABASE_URL="postgresql://clip:clip@clip-postgres-1:5432/clip_dev" \
  node:20 sh -c "corepack enable && corepack prepare pnpm@9.1.0 --activate && pnpm install"
```

This is exactly how this repo's first migration, typecheck, lint, test, and build were actually verified — see the "End-to-end verified" entry in [`../README.md`](../README.md#current-implementation-status). Swap the `-e DATABASE_URL=...` value for whatever `pnpm --filter @clip/db migrate:dev`/`migrate:deploy`/`seed` needs to reach (the `clip-postgres-1` container name, a Supabase connection string, etc.) — an explicit `-e` flag always overrides whatever `.env` on disk happens to say, which is a useful way to target a specific database deliberately per command.

## First-time setup

```bash
git clone <repo>
cd Clip
pnpm install
cp .env.example .env            # fill in real values for local dev
pnpm db:generate                # generates the Prisma client
pnpm db:migrate                 # applies migrations to your local database
pnpm dev                        # runs all apps + API via Turborepo
```

## Environment variables

See [`../../.env.example`](../../.env.example) for the full list. Never hardcode any of these in application code — always `process.env.X` (backend) or `process.env.NEXT_PUBLIC_X` (frontend, only for values safe to expose to the browser). Key groups:

- **Domains**: `PRIMARY_DOMAIN`, `PUBLIC_APP_URL`, `CLIPPER_APP_URL`, `BRAND_APP_URL`, `ADMIN_APP_URL`, `API_URL` — see [`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md).
- **Auth**: `AUTH_SECRET`, `AUTH_COOKIE_DOMAIN`, token TTLs — see [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md).
- **Database/Redis**: `DATABASE_URL`, `REDIS_URL`. `DIRECT_URL` is only needed when `DATABASE_URL` is a pooled (pgbouncer) connection, e.g. Supabase — `prisma migrate` uses the direct connection instead, per the `directUrl` field in `packages/db/prisma/schema.prisma`'s datasource block.
- **Meta/Instagram**: `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI` — see [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md).
- **Payments**: `PAYMENT_PROVIDER_KEY`, `PAYMENT_PROVIDER_SECRET`, `PAYMENT_WEBHOOK_SECRET` — see [`../finance/PAYMENT_SYSTEM.md`](../finance/PAYMENT_SYSTEM.md).

## Local subdomain testing

Real wildcard subdomains aren't available on `localhost`; local dev runs each app on a distinct port (see [`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md)). To test real cross-subdomain cookie behavior, map `*.localhost` hostnames per [`../deployment/DOMAIN_DEPLOYMENT.md`](../deployment/DOMAIN_DEPLOYMENT.md).

## Running a single app

```bash
pnpm --filter public-web dev
pnpm --filter clipper-app dev
pnpm --filter brand-app dev
pnpm --filter admin-app dev
pnpm --filter api dev
```

## Running workers

```bash
pnpm --filter api worker
```

(separate entrypoint from the HTTP API — see [`FOLDER_STRUCTURE.md`](FOLDER_STRUCTURE.md))

## Secrets hygiene

`.env` is gitignored; only `.env.example` (with placeholder/empty values) is committed. Never paste a real secret into a commit, PR description, or this documentation.

## Related documents

[`../../.env.example`](../../.env.example), [`../database/MIGRATION_STRATEGY.md`](../database/MIGRATION_STRATEGY.md), [`FOLDER_STRUCTURE.md`](FOLDER_STRUCTURE.md).
