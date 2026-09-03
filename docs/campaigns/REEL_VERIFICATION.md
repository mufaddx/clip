# Reel Verification

## Purpose

Before a submitted/detected reel counts toward performance or earnings, it must pass rule validation against the campaign's publishing requirements. A submission that fails contributes **zero** qualified performance regardless of its raw metrics — see [`../product/BUSINESS_RULES.md`](../product/BUSINESS_RULES.md).

## Checks performed (Reel Verification Worker)

- **Ownership** — the media belongs to the Instagram account connected to the accepting clipper.
- **Publish window** — publishing timestamp falls within the campaign's allowed window (after acceptance, before the campaign's submission deadline).
- **Content rules** — required caption elements, hashtags, and mentions (from `campaign_assets`/`campaign_requirements`) are present, where these are checkable via available media metadata.
- **Content restrictions** — the campaign's disallowed content types are not present, to the extent automatically checkable; ambiguous cases route to manual admin review rather than an automatic pass/fail.
- **Duplicate check** — this media id isn't already attributed to another campaign acceptance.

## Outcomes

| Status | Meaning | Next step |
|---|---|---|
| `VERIFIED` | All checks passed | Reel enters the tracking pipeline ([`../performance/METRIC_SNAPSHOTS.md`](../performance/METRIC_SNAPSHOTS.md)) |
| `REJECTED` | A check failed | Reason shown to the clipper; resubmission allowed up to the configured limit ([`REEL_SUBMISSION.md`](REEL_SUBMISSION.md)) |
| `MANUAL_REVIEW` | An ambiguous/unautomatable check | Queued to `admin.domain.in/clippers/verification` for a human decision |

## Rule ownership

Publishing rules being checked here are defined per-campaign in [`CAMPAIGN_CREATION_FLOW.md`](CAMPAIGN_CREATION_FLOW.md) Step 2/3, not hardcoded in the verification worker — the worker is a generic rule evaluator over whatever the campaign's `campaign_requirements`/`campaign_assets` specify.

## Re-verification

If a clipper edits nothing but the platform later detects the underlying media was deleted/unpublished on Instagram, the reel's status moves to `REMOVED` and any performance accrued up to that point is preserved as historical record but no further snapshots are taken (see [`../performance/METRIC_SNAPSHOTS.md`](../performance/METRIC_SNAPSHOTS.md)) — earnings already finalized from prior verified snapshots are not clawed back automatically; a suspected abuse case goes through [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md) instead.

## Related documents

[`REEL_SUBMISSION.md`](REEL_SUBMISSION.md), [`CAMPAIGN_RULES.md`](CAMPAIGN_RULES.md), [`../performance/PERFORMANCE_SYSTEM.md`](../performance/PERFORMANCE_SYSTEM.md), [`../admin/MODERATION_SYSTEM.md`](../admin/MODERATION_SYSTEM.md).
