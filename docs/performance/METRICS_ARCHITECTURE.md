# Metrics Architecture

## Purpose

Defines what raw metrics look like, where they come from, and how the system handles a field being unavailable for a given account/media rather than fabricating a value.

## Source

Every metric originates from the Meta Graph API against a connected Instagram account's media, via the isolated `instagram` module (see [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md)). Nothing is scraped or estimated.

## Metric fields (as available)

| Field | Notes |
|---|---|
| Views / Plays | Available for Reels; naming/availability depends on API version and account type |
| Reach | Unique accounts that saw the media |
| Likes | — |
| Comments | — |
| Shares | — |
| Saves | — |
| Watch metrics (e.g. average watch time) | Only exposed for certain account types/permissions |

Each field on a `reel_metrics`/`metric_snapshots` row is nullable — `null` means "not available for this account/media at this time," which is itself meaningful data (recorded, not discarded) rather than a missing/error state. Availability is tracked per snapshot (a set of "available_fields" alongside the values) so downstream performance calculation knows which inputs it can trust.

## Collection cadence

The Metrics Sync Worker (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)) pulls current insights for every actively-tracked reel on a cadence tied to the owning campaign's tracking window — more frequent early (to catch initial performance ramp) and less frequent as the window matures, to stay within Graph API rate limits.

## Data model relationship

```
campaign_reels (1) ──── (many) reel_metrics ──── (many) metric_snapshots
```

`reel_metrics` holds the current/latest known values per reel for fast reads (dashboards); `metric_snapshots` holds the full immutable history each collection produces — see [`METRIC_SNAPSHOTS.md`](METRIC_SNAPSHOTS.md) for why these are never merged into one mutable row.

## Precomputed aggregates

Campaign-level and creator-level rollups (used on dashboards) are maintained by the Campaign Progress Worker rather than aggregated from raw snapshots on every page load — see [`../architecture/SCALABILITY_ARCHITECTURE.md`](../architecture/SCALABILITY_ARCHITECTURE.md).

## Related documents

[`METRIC_SNAPSHOTS.md`](METRIC_SNAPSHOTS.md), [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md), [`PERFORMANCE_SYSTEM.md`](PERFORMANCE_SYSTEM.md).
