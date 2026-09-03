# Dispute System

## Purpose

A structured, evidence-based process for contesting a specific outcome — a payout, a verification rejection, a performance calculation — as distinct from general [`SUPPORT_SYSTEM.md`](SUPPORT_SYSTEM.md) inquiries. Disputes are what can trigger the exception-path ledger reversals described in [`../finance/REFUND_SYSTEM.md`](../finance/REFUND_SYSTEM.md).

## Dispute types

`Campaign` (e.g., a brand disputes a campaign's overall results), `Performance` (a specific reel's qualified performance calculation), `Payment` (a charge/deposit/refund issue), `Verification` (a rejected reel submission the clipper believes was wrongly rejected).

## Lifecycle

```
Open → Under Review → Waiting for Evidence → Resolved → Closed
```

- **Open** — filed by a brand or clipper against a specific `campaign`/`campaign_reel`/`payment` (polymorphic reference).
- **Under Review** — an admin has picked it up and is investigating using [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md), `wallet_ledger`, and `performance_calculations` history.
- **Waiting for Evidence** — admin has requested additional evidence from either party via `dispute_messages`.
- **Resolved** — a decision has been made; if upheld, compensating ledger entries are created per [`../finance/REFUND_SYSTEM.md`](../finance/REFUND_SYSTEM.md) / [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md).
- **Closed** — terminal, after both parties have been notified of the resolution.

## Data model

```
disputes: id, type, opened_by (user), target_type, target_id, status,
          resolution, resolved_by (admin), resolved_at, created_at
dispute_messages: id, dispute_id, author_id, author_type, body, attachments (evidence), created_at
```

## Resolution authority

- `ADMIN`/`SUPER_ADMIN` can resolve `Campaign` and `Verification` disputes.
- Resolutions requiring a financial reversal (`Performance`, `Payment` disputes that uphold a claim) require `FINANCE_ADMIN` or `SUPER_ADMIN` involvement, since only they can execute the compensating ledger entries (see [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md)).
- Every resolution is audit-logged with the full before/after of any financial change (see [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md)).

## Evidence

Disputes rely on the platform's own append-only records first (`metric_snapshots`, `performance_calculations`, `reel_verifications`) — these are pulled into the review automatically as context — supplemented by whatever additional evidence the parties submit via `dispute_messages` attachments.

## Related documents

[`SUPPORT_SYSTEM.md`](SUPPORT_SYSTEM.md), [`../finance/REFUND_SYSTEM.md`](../finance/REFUND_SYSTEM.md), [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md), [`../performance/PERFORMANCE_SCORING.md`](../performance/PERFORMANCE_SCORING.md), [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md).
