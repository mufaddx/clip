# Data Retention

## Purpose

What gets kept, for how long, and what can be purged — balancing audit/legal needs (especially around money and disputes) against storage growth from high-volume tables like `metric_snapshots`.

## Retention classes

| Data | Retention | Deletion mechanism |
|---|---|---|
| `users`, `brand_profiles`, `creator_profiles`, `admin_profiles` | Indefinite while account exists; soft-deleted (`deleted_at`) on account closure, never hard-deleted | Soft delete only |
| `wallets`, `wallet_ledger`, `transactions`, `payments`, `withdrawals`, `refunds` | Indefinite — financial history is never purged | Never deleted |
| `audit_logs` | Indefinite | Never deleted |
| `campaigns`, `campaign_creators`, `campaign_reels`, `reel_verifications` | Indefinite (campaign history is part of both brand and creator track record) | Soft delete on cancellation/removal requests |
| `metric_snapshots` | Full resolution retained for the life of the campaign + a configurable post-campaign window (e.g. 24 months) for dispute/audit purposes; older snapshots may be downsampled (e.g. daily rather than per-sync-interval) rather than deleted outright, to keep long-term trend charts meaningful while bounding storage growth | Downsample job, never a hard delete of a snapshot that fed a finalized `performance_calculations` row |
| `performance_calculations` | Indefinite — this is what earnings were actually paid against | Never deleted |
| `notifications` | Configurable (e.g. 12 months), older marked-read notifications purged | Scheduled purge job |
| `support_tickets`, `ticket_messages`, `disputes`, `dispute_messages` | Indefinite while related to a financial/campaign history that's still retained | Soft delete on closure only |
| `instagram_tokens` | Deleted immediately on disconnection/revocation (no reason to retain an unusable encrypted token) | Hard delete |
| Session/refresh token records | Deleted on logout/expiry | Scheduled cleanup job |

## Principles

- **Anything a payout, refund, or dispute could ever need to reference is never deleted.** When in doubt, retain and soft-delete rather than hard-delete.
- **User-initiated account deletion requests** (data subject rights, where applicable) anonymize personally identifying fields on `users`/profile tables while preserving the financial/audit rows needed for legal/accounting purposes, rather than removing the rows entirely — implemented as an explicit anonymization routine, not a cascading delete.
- **High-volume, low-long-term-value data** (raw per-sync `metric_snapshots` well after a campaign's dispute window has closed) is the only category eligible for downsampling/pruning, and only after the window in [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md) has definitively closed.

## Related documents

[`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md), [`../performance/METRIC_SNAPSHOTS.md`](../performance/METRIC_SNAPSHOTS.md), [`../finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md), [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md).
