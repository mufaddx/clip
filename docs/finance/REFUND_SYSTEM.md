# Refund System

## Purpose

How unspent brand budget is returned, and why refunds intentionally cannot touch funds already paid out to creators through the standard flow.

## What is refundable

- **Unspent locked budget** — when a campaign is cancelled, or completes with budget remaining unspent (e.g., fewer qualifying creators than the funded budget covered), the `LOCKED` remainder moves to `REFUNDABLE` then back to `AVAILABLE` (brand can spend it on another campaign) or out to the brand's original payment method if they request an actual cash refund.
- **Failed/erroneous deposits** — a duplicate or erroneous charge caught before it's spent can be refunded via the payment provider directly.

## What is not refundable through the standard flow

Funds already converted into creator earnings (`SPENT` bucket, credited to a creator's `PENDING`/`AVAILABLE`) are **not** eligible for a standard refund — reversing a paid creator's earnings requires a dispute resolution with explicit admin override and a full audit trail (see [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md)), never a routine refund button. This protects creators from having legitimately earned money clawed back casually.

## Flow (standard, unspent-budget refund)

```
Campaign cancelled/completed-with-underspend
  → LOCKED remainder → REFUNDABLE (wallet_ledger entries)
  → Brand chooses: "Return to Available Balance" (stays in-platform, immediate)
                or "Refund to Original Payment Method" (routes through payments module)
  → If cash refund: payments.refund() called against the provider
  → Provider confirms → refunds row + wallet_ledger DEBIT on REFUNDABLE, matching
    provider-side refund completes independently of the platform-side bookkeeping
```

## Dispute-driven reversal (exception path)

```
Dispute opened against a specific reel's earnings → Admin reviews evidence
  → Dispute upheld → Admin-initiated compensating ledger entries:
      creator's earning entry reversed (PENDING/AVAILABLE → DEBIT, with reason + dispute reference)
      brand's SPENT reduced, LOCKED or REFUNDABLE increased accordingly
  → Full audit_logs entry recorded (admin id, dispute id, before/after) — see ../admin/AUDIT_LOGS.md
```

This path is deliberately manual and admin-gated — it is never triggered automatically by an algorithm alone.

## Related documents

[`WALLET_SYSTEM.md`](WALLET_SYSTEM.md), [`PAYMENT_SYSTEM.md`](PAYMENT_SYSTEM.md), [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md), [`../campaigns/CAMPAIGN_RULES.md`](../campaigns/CAMPAIGN_RULES.md).
