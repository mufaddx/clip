# Background Jobs

## Purpose

Every asynchronous, retryable, or scheduled unit of work in CLIP runs through **BullMQ** queues backed by **Redis**. This document is the registry of workers, their triggers, and their failure-handling behavior — see [`../development/FOLDER_STRUCTURE.md`](../development/FOLDER_STRUCTURE.md) for where worker code lives (`apps/api/src/workers/*`, run via a separate `worker` process/entrypoint from the HTTP API).

## Worker registry

| Worker | Queue | Trigger | Purpose |
|---|---|---|---|
| Instagram Sync Worker | `instagram-sync` | Scheduled (per connected account, staggered) + on-demand | Refreshes tokens, pulls account-level insights |
| Reel Detection Worker | `reel-detection` | Scheduled poll + webhook event | Finds new eligible media on a connected account, matches to an accepted campaign |
| Reel Verification Worker | `reel-verification` | Enqueued on submission/detection | Validates a reel against campaign rules (caption, hashtags, mentions, publish window) |
| Metrics Sync Worker | `metrics-sync` | Scheduled (per active reel, on a cadence tied to campaign tracking window) | Pulls current insights, writes a new `metric_snapshots` row |
| Performance Calculation Worker | `performance-calc` | Enqueued after each metrics sync | Runs the qualified-performance rule engine against the latest snapshot |
| Campaign Progress Worker | `campaign-progress` | Scheduled | Aggregates campaign-level totals (spend, qualified performance, participant counts) for dashboard reads |
| Earnings Worker | `earnings` | Enqueued when a campaign's verification window closes | Moves qualifying performance into `wallet_ledger` entries (Pending → Available) |
| Notification Worker | `notifications` | Enqueued by any service on a notable event | Fans a notification out to in-app + email channels |
| Referral Reward Worker | `referral-rewards` | Enqueued when a referred account's eligibility state changes | Runs eligibility + fraud checks, posts the reward ledger entry if approved |

## Job requirements

- **Idempotency**: every job handler is safe to run twice with the same input (e.g., keyed by a unique constraint or an idempotency key) — a retried job must never double-post a ledger entry or double-send a notification.
- **Retries**: exponential backoff, capped attempt count (default 5) configured per queue; a job that exhausts retries moves to a dead-letter state rather than disappearing silently.
- **Logging**: structured log per attempt (job id, queue, attempt number, duration, outcome) so failures are traceable without reproducing locally.
- **Priority**: user-facing latency-sensitive jobs (e.g., reel verification right after submission) run on a higher-priority queue than routine scheduled syncs.
- **Scheduling**: cron-style repeatable jobs (BullMQ repeatable jobs) for anything on a fixed cadence (hourly metric syncs, daily campaign progress rollups).
- **Dead letter handling**: jobs that exhaust retries are moved to a `failed` state visible in a monitoring queue (BullMQ Board or equivalent) for manual triage — a payment/earnings job failure additionally raises an alert, since money is involved.

## Related documents

[`../architecture/META_INSTAGRAM_INTEGRATION.md`](META_INSTAGRAM_INTEGRATION.md), [`../performance/PERFORMANCE_SYSTEM.md`](../performance/PERFORMANCE_SYSTEM.md), [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md), [`../referrals/REFERRAL_SYSTEM.md`](../referrals/REFERRAL_SYSTEM.md).
