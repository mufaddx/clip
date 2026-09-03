# Campaign Rules

## Purpose

Consolidated reference of the business rules governing campaign behavior, enforced in `apps/api/src/modules/campaigns` — cross-linked from [`../product/BUSINESS_RULES.md`](../product/BUSINESS_RULES.md) since campaigns are that document's largest single section.

## Funding & budget

- `LIVE` requires `locked_budget == total_budget` (see [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md)).
- Platform fee percentage is captured at funding time and does not change retroactively if the platform-wide fee changes later.
- Budget cannot be increased/decreased after `LIVE` without going through an explicit "Adjust Budget" action that re-validates funding, logged distinctly from the original funding event.

## Participation

- `max_participants` is a hard cap; acceptance beyond it is rejected at the API level even if a race condition lets two requests through the frontend simultaneously (enforced via a DB-level constraint/transaction, not just an application check).
- A clipper cannot accept the same campaign twice.
- A clipper flagged `RISK_REVIEW` cannot accept any campaign until cleared (see [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md)).

## Objective & rules immutability

- `campaign_requirements` and the objective type are locked once the first clipper accepts — later edits create a new campaign rather than mutating an in-flight one, so every accepted clipper is playing by the rules they saw when they accepted.

## Approval

- Every campaign passes through `PENDING_REVIEW`, no exceptions (see [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md) invariants).
- Rejection always carries a reason string, persisted and shown to the brand.

## Pausing & cancellation

- Pausing stops new acceptances but does not stop tracking on already-accepted, in-progress reels.
- Cancelling releases unspent locked budget back to the brand's available wallet balance (see [`../finance/REFUND_SYSTEM.md`](../finance/REFUND_SYSTEM.md)); already-earned creator payments are not clawed back.

## Related documents

[`CAMPAIGN_SYSTEM.md`](CAMPAIGN_SYSTEM.md), [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md), [`../product/BUSINESS_RULES.md`](../product/BUSINESS_RULES.md), [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md).
