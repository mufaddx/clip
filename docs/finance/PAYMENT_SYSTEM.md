# Payment System

## Purpose

How real money enters CLIP (brand deposits) and how the platform integrates with a payment provider, kept as a swappable adapter so a provider change doesn't ripple through the ledger/wallet logic.

## Scope

- **Inbound**: brand deposits (`brand.domain.in/wallet/add-funds`) via card/bank transfer through the configured payment provider.
- **Outbound**: creator withdrawals (see [`WITHDRAWAL_SYSTEM.md`](WITHDRAWAL_SYSTEM.md)) and brand refunds (see [`REFUND_SYSTEM.md`](REFUND_SYSTEM.md)) also route through the same provider abstraction.

## Provider abstraction

`apps/api/src/modules/payments` exposes a narrow internal interface (`createDeposit`, `confirmDeposit`, `createPayout`, `refund`) — nothing else in the codebase calls the payment provider's SDK/HTTP API directly. Credentials (`PAYMENT_PROVIDER_KEY`, `PAYMENT_PROVIDER_SECRET`) never reach the frontend; the provider's client-side tokenization widget (if used) is the only piece that runs in the browser, and it never sees the platform's secret keys.

## Deposit flow

```
Brand submits an amount on /wallet/add-funds
  → API creates a payment intent with the provider, returns a client secret
  → Frontend collects payment details via the provider's hosted/tokenized UI
  → Provider confirms the charge → webhook fires to api.domain.in/v1/payments/webhook
  → Webhook signature verified (see ../architecture/SECURITY_ARCHITECTURE.md)
  → API creates a payments row + a wallet_ledger CREDIT on AVAILABLE
  → Brand sees the updated balance
```

Deposits are only recognized as available balance on webhook confirmation, not on the client-side "success" callback alone — the webhook is the source of truth for whether money actually moved, since a client callback can fire without the charge having truly settled.

## Payments table

`payments` records every provider transaction attempt (deposit, payout) — id, provider reference id, amount, currency, status (`PENDING`/`SUCCEEDED`/`FAILED`), the related `wallet_ledger` entry once posted, and full provider response metadata for support investigation.

## Failure handling

A failed/declined deposit never creates a ledger entry — the brand sees a specific error (see [`../ui-ux/ERROR_STATES.md`](../ui-ux/ERROR_STATES.md)) and can retry. A webhook that arrives for an already-processed payment (retry from the provider) is deduplicated by provider reference id (idempotent).

## Related documents

[`WALLET_SYSTEM.md`](WALLET_SYSTEM.md), [`LEDGER_ARCHITECTURE.md`](LEDGER_ARCHITECTURE.md), [`../api/WEBHOOKS.md`](../api/WEBHOOKS.md), [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md).
