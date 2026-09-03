# Performance Scoring

## Purpose

The mechanics of the configurable calculation engine that turns [`QUALIFIED_PERFORMANCE.md`](QUALIFIED_PERFORMANCE.md)'s factors into a single number, and how it stays auditable and reproducible as rules evolve.

## `performance_rules` shape (conceptual)

```
performance_rules
  id, version, objective_type, is_active,
  weights: { watch_quality, engagement_quality, reach_quality,
             campaign_compliance, historical_reliability },
  risk_thresholds: { anomaly_zscore_flag, ... },
  created_by (admin), created_at
```

Only one rule set per `objective_type` is `is_active = true` at a time; activating a new version deactivates the prior one but never deletes it — every past calculation references the specific version that produced it.

## Calculation flow

```
Verified reel + latest metric_snapshots
        ↓
Load the active performance_rules for this campaign's objective_type
        ↓
Compute each weighted factor (watch/engagement/reach/compliance/reliability)
        ↓
Combine per the rule's formula → raw qualified performance score
        ↓
Apply risk gating (if RISK_REVIEW flagged → hold, don't finalize)
        ↓
Write performance_calculations row: score, rule_version, snapshot_id, computed_at
```

`performance_calculations` is itself append-only like `metric_snapshots` — a recalculation (e.g., after a rule correction) inserts a new row rather than mutating the old one, preserving what was actually paid against at the time.

## Auditability

Given a `performance_calculations` row, an admin or a dispute investigator can reconstruct exactly: which raw snapshot fed it, which rule version and weights were applied, and what score resulted — the full chain required to explain any number that affected a payout (see [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md)).

## Admin configuration surface

`admin.domain.in/performance/qualified-performance` exposes weight editing per objective type; saving creates a new `performance_rules` version rather than editing in place. A preview/simulation view (running the new weights against recent historical snapshots before activating) is the recommended UX so an admin can sanity-check a change's impact before it goes live.

## Related documents

[`QUALIFIED_PERFORMANCE.md`](QUALIFIED_PERFORMANCE.md), [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md), [`../admin/ADMIN_PANEL.md`](../admin/ADMIN_PANEL.md).
