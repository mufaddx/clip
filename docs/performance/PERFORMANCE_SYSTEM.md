# Performance System

## Purpose

Raw views are never treated as the final business metric. Performance flows through distinct layers so every number paid out traces back to a verifiable snapshot and an auditable calculation, never a live "current view count" pulled at the moment of payout.

## Pipeline

```
RAW METRICS (official Graph API data, as available)
        ↓
METRIC SNAPSHOTS (immutable, timestamped)
        ↓
CAMPAIGN RULE VALIDATION (does this reel still count? see ../campaigns/REEL_VERIFICATION.md)
        ↓
PERFORMANCE CALCULATION (configurable rule engine)
        ↓
QUALIFIED PERFORMANCE (the number that actually matters)
        ↓
EARNINGS CALCULATION (../finance/CREATOR_EARNINGS.md)
```

## Layer responsibilities

- **Raw metrics** — whatever the connected account's permissions expose (views/plays, reach, likes, comments, shares, saves, available watch metrics), collected without inventing unavailable fields. See [`METRICS_ARCHITECTURE.md`](METRICS_ARCHITECTURE.md).
- **Metric snapshots** — every collection is a new row, never an overwrite, enabling trend analysis, recalculation, and fraud investigation. See [`METRIC_SNAPSHOTS.md`](METRIC_SNAPSHOTS.md).
- **Qualified performance** — a configurable scoring formula turning raw+validated metrics into the number campaigns are actually measured and paid against. See [`QUALIFIED_PERFORMANCE.md`](QUALIFIED_PERFORMANCE.md) and [`PERFORMANCE_SCORING.md`](PERFORMANCE_SCORING.md).

## Why the separation matters

- A brand disputing a payout can be shown the exact snapshot and rule version that produced a number — see [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md).
- A formula change (admin-configured) only affects calculations run after the change, since every calculation stores which rule version it used — historical numbers never silently shift under a brand or clipper's feet.
- Fraud/anomaly detection can compare a reel's snapshot trajectory against expected patterns without re-fetching from Meta.

## Ownership in code

`apps/api/src/modules/metrics` (raw collection + snapshots) and `apps/api/src/modules/performance` (rule engine + qualified performance), driven by the Metrics Sync Worker and Performance Calculation Worker (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)).

## Related documents

[`METRICS_ARCHITECTURE.md`](METRICS_ARCHITECTURE.md), [`METRIC_SNAPSHOTS.md`](METRIC_SNAPSHOTS.md), [`QUALIFIED_PERFORMANCE.md`](QUALIFIED_PERFORMANCE.md), [`PERFORMANCE_SCORING.md`](PERFORMANCE_SCORING.md), [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md).
