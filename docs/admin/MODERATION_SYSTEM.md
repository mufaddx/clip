# Moderation System

## Purpose

Handles content-level review that automated verification (see [`../campaigns/REEL_VERIFICATION.md`](../campaigns/REEL_VERIFICATION.md)) couldn't resolve automatically, plus proactive review of flagged campaign content before it reaches creators.

## What enters the moderation queue

- `MANUAL_REVIEW` outcomes from reel verification (ambiguous content-rule checks).
- Campaign content flagged during the approval queue for policy concerns beyond the standard requirements checklist (e.g., a campaign's brief content is borderline against platform content policy).
- User-reported content (a clipper or brand reporting another party's campaign/submission through support).

## Moderation actions

| Action | Effect |
|---|---|
| Approve | Reel/campaign content proceeds normally |
| Reject with reason | Reel fails verification (clipper notified, can resubmit per [`../campaigns/REEL_SUBMISSION.md`](../campaigns/REEL_SUBMISSION.md)); campaign content flagged for the brand to revise |
| Escalate | Routes to a `SUPER_ADMIN` for a policy-level decision beyond a single `ADMIN`'s authority |

## Permissions

Only `SUPER_ADMIN` and `ADMIN` can take moderation actions (see [`ADMIN_PERMISSIONS.md`](ADMIN_PERMISSIONS.md)); `SUPPORT` can view flagged items in context while handling a related ticket but cannot resolve the moderation decision itself.

## Relationship to disputes

A moderation decision is about whether content/a submission is acceptable going forward; a dispute (see [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md)) is about contesting an outcome that already happened (a payout, a rejection) after the fact. A rejected moderation outcome can lead to a dispute being opened by the affected party, but the two systems remain distinct.

## Audit trail

Every moderation decision writes to [`AUDIT_LOGS.md`](AUDIT_LOGS.md) with the reviewing admin, the decision, and the reason — the same standard as every other admin action.

## Related documents

[`../campaigns/REEL_VERIFICATION.md`](../campaigns/REEL_VERIFICATION.md), [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md), [`ADMIN_PERMISSIONS.md`](ADMIN_PERMISSIONS.md).
