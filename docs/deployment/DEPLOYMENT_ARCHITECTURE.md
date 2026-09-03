# Deployment Architecture

## Purpose

How the five applications and their infrastructure dependencies get deployed, independent of the specific hosting provider chosen — this document describes the shape, [`CI_CD.md`](CI_CD.md) describes the pipeline mechanics.

## Deployable units

| Unit | What it is | Scales via |
|---|---|---|
| `public-web`, `clipper-app`, `brand-app`, `admin-app` | 4 independent Next.js deployments | Horizontal, stateless (e.g., Vercel projects or containers behind a load balancer) |
| `api` (HTTP) | NestJS HTTP server | Horizontal, stateless, behind a load balancer |
| `api` (worker) | Same codebase, `worker.ts` entrypoint, run as separate processes/containers | Horizontal, scaled independently of the HTTP tier based on queue depth |
| PostgreSQL | Managed Postgres instance | Vertical first, read replicas later (see [`../architecture/SCALABILITY_ARCHITECTURE.md`](../architecture/SCALABILITY_ARCHITECTURE.md)) |
| Redis | Managed Redis instance | Vertical; BullMQ queue depth is the signal to add worker capacity, not necessarily Redis capacity |

## Why HTTP and workers are split

The API's HTTP tier must stay responsive for user-facing requests; long-running or bursty jobs (Instagram sync, metric collection, performance calculation) must never share a process with request handling, or a burst of background work would degrade dashboard load times. Both share the same `apps/api` codebase and service layer (see [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md)) but run as separate deployable processes with independent scaling.

## Environments

| Environment | Purpose |
|---|---|
| Local | Individual developer machines, per [`../development/ENVIRONMENT_SETUP.md`](../development/ENVIRONMENT_SETUP.md) |
| Preview | Ephemeral, per-PR deployments for review (all 5 units, pointed at a shared or per-preview database) |
| Staging | Persistent pre-production environment mirroring production config, used for final verification before release |
| Production | The real `PRIMARY_DOMAIN` environment |

## Configuration boundary

Every environment differs only by environment variables (see [`../../.env.example`](../../.env.example)) and infrastructure sizing — never by a code branch checking `if (env === 'production')` for business logic. Environment-specific *behavior* (e.g., verbose logging in dev) is fine; environment-specific *business rules* are not.

## Related documents

[`ENVIRONMENT_STRATEGY.md`](ENVIRONMENT_STRATEGY.md), [`DOMAIN_DEPLOYMENT.md`](DOMAIN_DEPLOYMENT.md), [`CI_CD.md`](CI_CD.md), [`../architecture/SCALABILITY_ARCHITECTURE.md`](../architecture/SCALABILITY_ARCHITECTURE.md).
