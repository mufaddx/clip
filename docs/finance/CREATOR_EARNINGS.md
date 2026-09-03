# Creator Earnings

## Purpose

How a clipper's Qualified Performance (see [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md)) becomes an actual wallet balance, and why it passes through a `PENDING` state before becoming spendable/withdrawable.

## Calculation

Once a campaign's reel has a finalized `performance_calculations` score, the Earnings Worker (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)) converts it into a monetary amount using the campaign's payout structure (defined at campaign creation — e.g., a rate per qualified-performance-point, or a share of the campaign's creator budget proportional to the clipper's share of total qualified performance across all participants, depending on the campaign's configured payout model).

## Why earnings start `PENDING`

```
Qualified performance finalized → earnings amount calculated
        ↓
wallet_ledger CREDIT on creator's PENDING bucket
        ↓
Campaign's verification/tracking window closes (a fixed period, configurable per campaign)
        ↓
   no successful dispute filed  →  PENDING → AVAILABLE (creator can withdraw)
   dispute upheld against this reel → the PENDING amount is reversed via a compensating DEBIT,
       never a direct edit of the original entry (see ../finance/LEDGER_ARCHITECTURE.md)
```

This window exists so a brand has a real opportunity to dispute a clearly fraudulent or rule-violating reel before money becomes irreversibly available to the creator — see [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md).

## Matching brand-side accounting

Every creator earnings credit has a corresponding brand-side movement: `LOCKED` decreases and `SPENT` increases by the same amount, in the same transaction (see [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md)) — a campaign's budget is never "spent" on the brand side without a matching creator credit existing.

## Display

`clipper.domain.in/earnings` shows a per-campaign breakdown (qualified performance score, calculated amount, current bucket) and a running total; `/wallet` shows the aggregated bucket view used for withdrawal eligibility.

## Related documents

[`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md), [`WALLET_SYSTEM.md`](WALLET_SYSTEM.md), [`WITHDRAWAL_SYSTEM.md`](WITHDRAWAL_SYSTEM.md), [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md).
