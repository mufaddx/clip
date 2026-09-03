# Scalability Architecture

## Purpose

How CLIP grows from a single small deployment to handling many concurrent campaigns, creators, and metric-sync volume without a rewrite.

## Stateless application tier

`apps/api` and all four Next.js apps are stateless (session lives in the JWT/cookie, not server memory) so any of them can run as multiple horizontally-scaled instances behind a load balancer with no sticky-session requirement.

## Database

- PostgreSQL as the single source of truth, with read replicas introduced once dashboard read load (analytics, reports) becomes contention-heavy — analytics queries are the first candidate to route to a replica.
- Heavy aggregate reads (brand analytics, admin dashboard totals) are backed by precomputed/materialized rows updated by workers, not computed live from raw tables on every request — see [`../performance/METRICS_ARCHITECTURE.md`](../performance/METRICS_ARCHITECTURE.md).
- Indexes are defined per access pattern up front (foreign keys, status columns used in filters, `created_at` for pagination) — see [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md).

## Background processing

All slow/bursty work (Instagram sync, reel verification, performance calculation, payouts, notifications, referral rewards) runs in BullMQ workers backed by Redis, not inline in an HTTP request — see [`BACKGROUND_JOBS.md`](BACKGROUND_JOBS.md). Workers scale independently of the API by running more worker processes/containers; queue depth is the scaling signal.

## Rate-limited external dependency

The Meta Graph API has its own rate limits per app/per user token. The `instagram` module centralizes all Graph API calls so backoff/retry/rate-limit handling exists in one place, and sync jobs are scheduled/staggered (not a thundering herd at the top of every hour) — see [`META_INSTAGRAM_INTEGRATION.md`](META_INSTAGRAM_INTEGRATION.md).

## Caching

- CDN-level caching for `public-web` static/ISR pages.
- Application-level caching (Redis) for expensive, slow-changing reads — e.g., campaign recommendation scores recomputed periodically rather than on every dashboard load.
- React Query client-side caching reduces redundant API calls from the frontends.

## Multi-tenancy shape

Brands and clippers are logically isolated by ownership checks in the service layer (every query scoped by `brand_id`/`clipper_id` derived from the authenticated session), not by separate databases/schemas — this keeps the initial architecture simple while the platform is single-database-scale; a move to schema-per-large-tenant is a later option if ever needed, not a v1 concern.

## Growth path (not built now, but not precluded)

- Read replicas for Postgres once needed.
- Splitting the `instagram` sync worker into its own deployable service if Graph API volume grows large enough to want independent scaling/alerting from other workers.
- Adding a message broker between API and workers beyond BullMQ/Redis only if job volume outgrows Redis-backed queues — not anticipated at launch scale.

## Related documents

[`BACKGROUND_JOBS.md`](BACKGROUND_JOBS.md), [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md), [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md).
