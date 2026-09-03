# Analytics System

## Purpose

The live, interactive data views inside each dashboard app (`/analytics` in clipper and brand apps, `/performance` overview in admin) — distinct from [`REPORTING_SYSTEM.md`](REPORTING_SYSTEM.md)'s exportable summaries, though both draw from the same underlying aggregates.

## Clipper analytics

Cross-campaign performance trends: qualified performance over time, earnings over time, campaign acceptance-to-completion funnel, category performance breakdown (which content categories perform best for this creator).

## Brand analytics

Campaign performance trends across all the brand's campaigns, creator performance leaderboard (which creators are driving the most qualified performance), budget efficiency (qualified performance per currency unit spent), category breakdown.

## Admin analytics (`/performance` section)

Platform-wide metric tracking, qualified performance distribution, suspicious activity trend lines feeding the risk-review queues (see [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md)).

## Data source

All analytics views read from precomputed aggregate tables/materialized rows maintained by background workers (Campaign Progress Worker, Metrics Sync Worker outputs) rather than aggregating raw `metric_snapshots` on every request — see [`../architecture/SCALABILITY_ARCHITECTURE.md`](../architecture/SCALABILITY_ARCHITECTURE.md). Where a view needs finer granularity than the precomputed aggregate provides, it queries `metric_snapshots` directly but scoped to a bounded, indexed range (e.g., a single campaign's reels).

## Charting conventions

Charts follow the `dataviz` skill's conventions and the shared chart components in [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md) (`LineChart`, `BarChart`, `DonutChart`, `Sparkline`) — consistent color-by-series, legends, and tooltips across all three apps.

## Related documents

[`REPORTING_SYSTEM.md`](REPORTING_SYSTEM.md), [`../performance/METRICS_ARCHITECTURE.md`](../performance/METRICS_ARCHITECTURE.md), [`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md).
