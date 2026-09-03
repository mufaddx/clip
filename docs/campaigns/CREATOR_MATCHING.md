# Creator Matching

## Purpose

Not every campaign is shown to every clipper. Matching determines what appears in a clipper's Recommended and Available tabs, and who is eligible to accept at all — protecting both campaign quality (brands get relevant creators) and clipper experience (no irrelevant spam).

## Eligibility gate (hard filter, before ranking)

A campaign is only visible/acceptable to a clipper if **all** hold:

- The clipper's account category overlaps the campaign's target categories (`campaign_requirements.categories`).
- The clipper's connected Instagram account meets the campaign's minimum eligibility (follower count, account age, trust score — see [`CAMPAIGN_CREATION_FLOW.md`](CAMPAIGN_CREATION_FLOW.md) Step 3).
- The clipper is not `RISK_REVIEW` flagged (see [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md)).
- The campaign has not reached `max_participants`.
- The campaign is `LIVE` (not `PAUSED`, which blocks new acceptances).

Clippers who fail this gate never see the campaign in Available/Recommended at all — this is a query filter, not a hidden-but-present card.

## Ranking score (Recommended tab ordering)

Among eligible campaigns, a matching score orders the Recommended tab, considering **(configurable weights)**:

- Creator Categories — overlap strength between clipper interests and campaign categories.
- Account Category fit — how closely the account's typical content matches the campaign's content type.
- Historical Performance — the clipper's track record of qualified performance on similar past campaigns.
- Trust Score — a rolling reliability signal (verification pass rate, dispute history, fraud flags).
- Campaign Requirements fit — how comfortably the clipper clears the minimum thresholds (comfortably above vs. borderline).

`Available` shows all eligible campaigns unranked (or reverse-chronological); `Recommended` is the ranked subset most likely to be a good fit.

## Invitations

A brand may also target specific clippers directly (`campaign_invitations`) — bypassing the ranking (but not the hard eligibility gate) — surfaced in the clipper's Invited tab. An invited clipper who doesn't meet minimum eligibility still cannot accept; the invitation is informational until eligibility is met, if ever.

## Recalculation

Matching scores are recomputed periodically by a background job (not on every page load) since they depend on slow-changing signals (trust score, historical performance) — see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md).

## Related documents

[`CAMPAIGN_SYSTEM.md`](CAMPAIGN_SYSTEM.md), [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md), [`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md).
