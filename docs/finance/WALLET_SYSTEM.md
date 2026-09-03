# Wallet System

## Purpose

Every user-facing balance (brand and creator) is backed by a `wallets` row whose displayed balance is derived from — and always reconcilable against — an append-only ledger. No code path ever writes directly to a balance field without a corresponding ledger entry. See [`LEDGER_ARCHITECTURE.md`](LEDGER_ARCHITECTURE.md) for the ledger mechanics this system is built on.

## Brand wallet buckets

| State | Meaning |
|---|---|
| `AVAILABLE` | Funds the brand can spend (fund a new campaign) or withdraw/refund |
| `LOCKED` | Funds committed to a specific campaign's budget while it is `FUNDED`/`LIVE`/`PAUSED` |
| `SPENT` | Funds that have converted into paid creator earnings |
| `REFUNDABLE` | Unspent `LOCKED` funds released back toward `AVAILABLE` on campaign cancellation/completion-with-underspend |

## Creator wallet buckets

| State | Meaning |
|---|---|
| `PENDING` | Qualified performance has been calculated but the campaign's verification/tracking window hasn't closed yet |
| `AVAILABLE` | Earnings finalized and withdrawable |
| `PROCESSING` | A withdrawal has been requested against `AVAILABLE` and is being paid out |
| `WITHDRAWN` | Historical total already paid out |

## Campaign funding flow

```
Brand adds funds → AVAILABLE increases (wallet_ledger: CREDIT, source=deposit)
        ↓
Campaign approved → brand funds it → AVAILABLE decreases, LOCKED increases
        (wallet_ledger: two linked entries, same transaction)
        ↓
Campaign runs, reels tracked, qualified performance calculated
        ↓
Earnings Worker converts qualified performance into creator PENDING earnings
        (brand LOCKED decreases → SPENT increases, matched by creator PENDING credit)
        ↓
Verification window closes without a successful dispute
        ↓
Creator PENDING → AVAILABLE
```

Full mechanics: [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md) (Earnings Worker), [`CREATOR_EARNINGS.md`](CREATOR_EARNINGS.md).

## Invariants

- `wallets.balance` (and each bucket) is either a maintained running total updated only inside the same transaction as its `wallet_ledger` entry, or a value periodically reconciled against a `SUM()` over the ledger — either way, the ledger is the source of truth and a mismatch is a bug to fix, not a balance to trust blindly.
- Every financial mutation (fund, spend, earn, withdraw, refund) is wrapped in a single database transaction so a partial write (e.g., debiting one bucket without crediting the other) cannot occur.

## Related documents

[`LEDGER_ARCHITECTURE.md`](LEDGER_ARCHITECTURE.md), [`PAYMENT_SYSTEM.md`](PAYMENT_SYSTEM.md), [`CREATOR_EARNINGS.md`](CREATOR_EARNINGS.md), [`WITHDRAWAL_SYSTEM.md`](WITHDRAWAL_SYSTEM.md), [`REFUND_SYSTEM.md`](REFUND_SYSTEM.md).
