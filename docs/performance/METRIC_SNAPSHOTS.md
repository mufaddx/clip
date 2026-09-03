# Metric Snapshots

## Purpose

Historical metrics are never overwritten. Every collection from the Meta Graph API produces a new, immutable `metric_snapshots` row, enabling historical analytics, trend analysis, performance recalculation, and fraud investigation without ever losing what was true at a given point in time.

## Shape

Per snapshot: `reel_id` (FK to `campaign_reels`), the metric values collected (views, reach, likes, comments, shares, saves, watch metrics — nullable per [`METRICS_ARCHITECTURE.md`](METRICS_ARCHITECTURE.md)), which fields were available at collection time, and `collected_at`.

## Why append-only

- **Historical analytics** — a performance trend chart reads the full snapshot series, not a single current value.
- **Trend analysis** — velocity (rate of change between snapshots) is itself a signal used in [`QUALIFIED_PERFORMANCE.md`](QUALIFIED_PERFORMANCE.md) and fraud detection.
- **Performance recalculation** — if a `performance_rules` version is corrected, historical qualified performance can be recomputed against the original snapshots without needing to re-fetch from Meta (which may no longer reflect the same numbers, or the content may have since been deleted).
- **Fraud investigation** — an implausible jump between two snapshots (e.g., views spiking far outside the account's historical pattern) is visible and reviewable after the fact, not just in the moment.

## Retention

Snapshots are retained per [`../database/DATA_RETENTION.md`](../database/DATA_RETENTION.md) — financial/audit-relevant history is kept far longer than routine operational data, and snapshots that fed a finalized earnings calculation are never purged.

## Access pattern

- Dashboards read `reel_metrics` (the fast "latest known" table) for current display.
- Analytics/trend views and the Performance Calculation Worker read the `metric_snapshots` series directly.
- Snapshots are queried by `reel_id` + `collected_at` range; indexed accordingly (see [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md)).

## Related documents

[`METRICS_ARCHITECTURE.md`](METRICS_ARCHITECTURE.md), [`QUALIFIED_PERFORMANCE.md`](QUALIFIED_PERFORMANCE.md), [`../database/DATA_RETENTION.md`](../database/DATA_RETENTION.md).
