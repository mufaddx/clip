# Reporting System

## Purpose

Exportable, presentable summaries of campaign results and platform activity — distinct from the live dashboards in [`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md), which are for monitoring, not for handing to a stakeholder as a deliverable.

## Brand reports (`brand.domain.in/reports`)

Per-campaign result summaries: total spend, qualified performance achieved vs. objective target, participant count, top-performing creators, timeline chart. Exportable as PDF/CSV for sharing outside the platform (e.g., with the brand's own internal stakeholders).

## Admin reports (`admin.domain.in/reports`)

Platform-wide operational reports: revenue over a period, campaign approval throughput/turnaround time, withdrawal processing times, dispute resolution times, referral program performance. Used for internal platform operations review, not shown to brands/clippers.

## Generation approach

Reports are generated from the same precomputed aggregate tables used by dashboards (see [`../architecture/SCALABILITY_ARCHITECTURE.md`](../architecture/SCALABILITY_ARCHITECTURE.md)) plus a report-specific query/render step — heavy report generation (large PDF exports) runs as a background job with the user notified when the export is ready, rather than blocking the request (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)).

## Data integrity

Every figure in a report traces back to the same source of truth as the live dashboards (`wallet_ledger`, `performance_calculations`, `metric_snapshots`) — a report is a formatted view of real recorded data, never a separately-computed estimate that could drift from what the platform actually recorded.

## Scheduling (future)

v1 reports are generated on-demand; scheduled recurring report delivery (e.g., a weekly summary emailed automatically) is a documented future extension of this same generation pipeline, not a separate system.

## Related documents

[`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md), [`ANALYTICS_SYSTEM.md`](ANALYTICS_SYSTEM.md), [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md).
