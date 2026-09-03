# Meta / Instagram Integration

## Purpose

CLIP integrates with Instagram **exclusively through official Meta APIs** (Instagram Graph API / Instagram Platform, via a Meta Business app with the Instagram Content Publishing / Instagram Basic Display or successor permission set applicable at implementation time). No scraping, no unofficial endpoints, no browser automation against Instagram. This is a hard constraint, not a preference.

## Isolation

All Graph API access lives behind `apps/api/src/modules/instagram`. No other module, worker, or frontend calls the Meta SDK/HTTP endpoints directly — everything goes through this module's internal service interface (`connectAccount`, `refreshToken`, `getAccountInsights`, `getMediaInsights`, `findMediaByPermalink`, `verifyOwnership`). This keeps rate-limit handling, token refresh, and API-version upgrades a one-module concern.

## Account authorization flow

```
Clipper clicks "Connect Instagram" (clipper.domain.in/instagram)
  → Redirect to Meta OAuth dialog (scopes requested match only what's needed)
  → Clipper approves on Meta's own UI
  → Meta redirects to META_REDIRECT_URI (api.domain.in/v1/instagram/oauth/callback)
  → API exchanges the auth code for a short-lived token, then a long-lived token
  → Long-lived token encrypted (AES-256-GCM) and stored in instagram_tokens
  → Account metadata (IG user id, username, account type) stored in instagram_accounts
  → Clipper redirected back to clipper.domain.in/instagram with the account listed as Connected
```

## What is stored

- `instagram_accounts`: platform user id, username, account type/category, connection status, last synced at.
- `instagram_tokens`: encrypted long-lived token, expiry, refresh history — never the plaintext token at rest, never returned in any API response.

## Token monitoring & connection health

The Instagram Sync Worker (see [`BACKGROUND_JOBS.md`](BACKGROUND_JOBS.md)) periodically refreshes long-lived tokens before expiry and records connection health (`HEALTHY`, `EXPIRING_SOON`, `EXPIRED`, `REVOKED`, `ERROR`) surfaced to the clipper (reconnect prompt) and to admins (`admin.domain.in/instagram`) for platform-wide monitoring.

## Reel detection

```
Clipper accepts a campaign
  → Clipper publishes content on their own Instagram account
  → EITHER: Reel Detection Worker's scheduled media sync finds new eligible media
    OR: Clipper manually submits the reel URL (clipper.domain.in campaign detail page)
  → Media identified via Graph API (permalink → media id, or direct media id lookup)
  → Ownership verified: does this media belong to the connected account tied to this campaign acceptance?
  → Campaign matching: is this media reasonably tied to the accepted campaign (timing window, submission link)?
  → Reel Verification Worker validates against campaign publishing rules (caption/hashtag/mention requirements, publish window)
  → campaign_reels row created/updated with verification status
```

Stored per reel: platform media id, reel URL/permalink, publishing timestamp, verification status, the campaign + clipper it's attributed to.

## Metrics collection

Only metrics the connected account's permissions and account type actually expose are collected — the schema for `reel_metrics`/`metric_snapshots` (see [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md)) stores a flexible set of fields (views/plays, reach, likes, comments, shares, saves, available watch metrics) where unavailable fields are simply `null`, never fabricated or estimated. Availability is itself recorded per snapshot so downstream performance calculation knows which inputs it can trust for a given reel.

## Rate limits & resilience

- All Graph API calls go through a shared client with backoff/retry on rate-limit responses.
- Sync jobs are staggered per account (not all fired at the same scheduled minute) to avoid bursts against the app-level rate limit.
- A failed sync records the failure reason on the account's connection health rather than silently retrying forever.

## Related documents

[`BACKGROUND_JOBS.md`](BACKGROUND_JOBS.md), [`../campaigns/REEL_SUBMISSION.md`](../campaigns/REEL_SUBMISSION.md), [`../campaigns/REEL_VERIFICATION.md`](../campaigns/REEL_VERIFICATION.md), [`../performance/METRICS_ARCHITECTURE.md`](../performance/METRICS_ARCHITECTURE.md), [`SECURITY_ARCHITECTURE.md`](SECURITY_ARCHITECTURE.md).
