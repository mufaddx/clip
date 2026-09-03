# Withdrawal System

## Purpose

How a clipper turns `AVAILABLE` wallet balance into money in their bank account/payment method, through an auditable state machine rather than an instant, unqueued transfer.

## State machine

```
REQUESTED ──(auto or admin approval, configurable per platform risk posture)──▶ APPROVED
    │                                                                              │
    └──(fails basic checks: e.g. amount exceeds AVAILABLE)──▶ REJECTED             ▼
                                                                                PROCESSING (sent to payment provider)
                                                                                   │
                                                              ┌────────────────────┼───────────────┐
                                                              ▼                                     ▼
                                                            PAID                                  FAILED
                                                     (provider confirms payout)          (provider rejects; funds
                                                                                          returned to AVAILABLE)
```

## Flow

```
Clipper submits a withdrawal request (clipper.domain.in/withdrawals)
  → API validates: amount ≤ AVAILABLE balance, payout method on file, no active hold on the account
  → wallet_ledger DEBIT: AVAILABLE → PROCESSING (immediately, so the same funds can't be
    requested twice while the payout is in flight)
  → withdrawals row created (REQUESTED → APPROVED per configured policy)
  → payments module's createPayout() called against the provider
  → Provider webhook confirms → withdrawals.status = PAID, wallet_ledger: PROCESSING → WITHDRAWN
    OR provider reports failure → withdrawals.status = FAILED,
       wallet_ledger reversing entry: PROCESSING → AVAILABLE (funds returned)
```

## Rules

- A withdrawal amount can never exceed the current `AVAILABLE` bucket at request time — checked and locked inside the same transaction that debits it, preventing a race between two concurrent requests from over-withdrawing.
- `FINANCE_ADMIN`/`SUPER_ADMIN` can configure whether withdrawals require manual approval above a threshold amount, or are auto-approved below it — visible in `admin.domain.in/finance/withdrawals`.
- A rejected/failed withdrawal always returns funds to `AVAILABLE` via a ledger entry, never a silent balance restoration.
- Minimum withdrawal amount and payout method requirements (configurable) are enforced before a request is even accepted.

## Visibility

- Clipper: full history and live status at `/withdrawals`.
- Admin: queue of pending/processing withdrawals at `admin.domain.in/finance/withdrawals`, with the ability to intervene (hold, manually mark failed with reason) when a provider payout stalls.

## Related documents

[`WALLET_SYSTEM.md`](WALLET_SYSTEM.md), [`LEDGER_ARCHITECTURE.md`](LEDGER_ARCHITECTURE.md), [`PAYMENT_SYSTEM.md`](PAYMENT_SYSTEM.md), [`../admin/ADMIN_PANEL.md`](../admin/ADMIN_PANEL.md).
