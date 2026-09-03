# Ledger Architecture

## Purpose

The `wallet_ledger` table is the immutable, append-only record of every financial movement in CLIP. `wallets.balance` (and its buckets) is a derived/cached value; `wallet_ledger` is the truth. This document defines the entry shape and the invariants that keep it trustworthy.

## Entry shape (conceptual)

```
wallet_ledger
  id, wallet_id, type (CREDIT | DEBIT), bucket (AVAILABLE | LOCKED | SPENT | PENDING | PROCESSING | WITHDRAWN | REFUNDABLE),
  amount, currency, source (deposit | campaign_fund | campaign_spend | earning | withdrawal | refund | referral_reward | adjustment),
  related_transaction_id, related_entity_type, related_entity_id,
  balance_after, created_at, created_by (system | user_id | admin_id)
```

## Invariants

1. **Append-only.** No update or delete path exists in the application layer for `wallet_ledger` rows. A correction is a new, opposite-direction entry referencing the original (`related_transaction_id`), never an edit.
2. **Every entry is part of a balanced transaction.** A campaign funding event writes a `DEBIT` on the brand's `AVAILABLE` and a `CREDIT` on the brand's `LOCKED` in the same DB transaction — the two always net to zero across the movement, never a dangling one-sided write.
3. **`balance_after` is stored on write**, not computed later — so historical statements don't depend on replaying the whole ledger to display what the balance was at any point in time.
4. **Idempotency keys** on entries created by background jobs (earnings, referral rewards) prevent a retried job from double-posting — see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md).

## Reconciliation

A scheduled job periodically recomputes each wallet's bucket totals from `SUM(wallet_ledger)` and compares against the cached `wallets` row; a mismatch raises an alert for investigation rather than silently auto-correcting (auto-correction would hide a bug that moved real money incorrectly).

## `transactions` vs `wallet_ledger`

`transactions` groups related `wallet_ledger` entries under one user-facing event (e.g., "Campaign funded — $500") for display purposes (transaction history lists); `wallet_ledger` remains the granular, always-correct accounting record underneath.

## Who can read what

- A brand/clipper can read their own wallet's ledger entries (`/wallet` transaction history) — never another user's.
- `FINANCE_ADMIN`/`SUPER_ADMIN` can read any wallet's ledger from `admin.domain.in/finance/transactions` for support/dispute investigation, itself audit-logged as an access (see [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md)).

## Related documents

[`WALLET_SYSTEM.md`](WALLET_SYSTEM.md), [`PAYMENT_SYSTEM.md`](PAYMENT_SYSTEM.md), [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md).
