# Reel Submission

## Purpose

How a clipper's published content gets tied to a `campaign_creators` acceptance and enters the tracking pipeline. Two paths lead here, and both converge on the same `campaign_reels` record and verification step (see [`REEL_VERIFICATION.md`](REEL_VERIFICATION.md)).

## Path A — automatic detection

The Reel Detection Worker (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)) periodically syncs recent media on a clipper's connected Instagram account and matches new posts to an active `campaign_creators` acceptance by timing (published after acceptance, within the campaign's submission window) and, where available, caption/hashtag signals from the campaign's requirements.

## Path B — manual submission

On the campaign detail page's Submission tab (`clipper.domain.in/campaigns/[id]`), the clipper pastes the reel's URL. The API resolves the permalink to a media id via the Graph API and verifies ownership (does this media belong to the connected account tied to this acceptance?) before creating the `campaign_reels` row.

## What gets stored

Per [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md): platform media id, reel URL/permalink, publishing timestamp, the `campaign_creators` row it's attributed to, and an initial `PENDING_VERIFICATION` status.

## Rules

- A single media item can only be attributed to one campaign acceptance — submitting the same reel URL against two different accepted campaigns is rejected.
- Submission is only accepted while the `campaign_creators` acceptance is in an active state (not if the brand's campaign has since been paused/cancelled, though already-tracking reels are unaffected by a pause — only new submissions are blocked).
- A clipper can resubmit a corrected URL if their first submission was rejected at verification, up to a configurable resubmission limit per acceptance.

## Related documents

[`REEL_VERIFICATION.md`](REEL_VERIFICATION.md), [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md), [`../performance/METRICS_ARCHITECTURE.md`](../performance/METRICS_ARCHITECTURE.md).
