# Business Rules

Rules in this document must be enforced in backend services, never only in UI. Each is tagged **(configurable)** if it lives in admin-editable `system_settings`/rule tables rather than code.

## Campaigns

- A campaign cannot transition to `LIVE` unless `campaign.locked_budget == campaign.total_budget` (fully funded).
- A campaign's `max_participants` (configurable per campaign) cannot be exceeded — acceptance is rejected once reached, not silently allowed and truncated later.
- Campaign objective type determines which raw metrics feed Qualified Performance; changing objective type after creators have joined is blocked (create a new campaign instead).
- Rejection by admin requires a reason string; it is stored and shown to the brand.

## Creator matching

- A campaign is only shown to a clipper if the clipper's account category overlaps the campaign's target categories **and** the clipper meets the campaign's minimum eligibility (follower/account-age/trust-score thresholds — all **(configurable)**).
- A clipper flagged `RISK_REVIEW` is excluded from new campaign recommendations until cleared by an admin.

## Performance

- Raw metric snapshots are append-only; a correction is a new snapshot with a later `collected_at`, never a mutation of a prior row.
- Qualified Performance is only calculated once a submission has both a metric snapshot **and** a passed rule validation; a submission that fails validation contributes zero qualified performance regardless of raw numbers.
- Performance rule weights/formulas are **(configurable)** via `performance_rules`, versioned so historical calculations remain reproducible against the rule version active at calculation time.

## Finance

- No code path updates `wallets.balance` directly. Every balance change is written as a `wallet_ledger` entry; the balance is either a maintained aggregate recomputed from the ledger or reconciled against it on a schedule — see [`finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md).
- Creator earnings move `PENDING → AVAILABLE` only after the campaign's verification window closes without a successful dispute.
- A withdrawal request debits `AVAILABLE` into `PROCESSING` immediately (so the same funds can't be withdrawn twice) and only fully settles on payment provider confirmation.
- Refunds to a brand can only return **unspent locked budget**; funds already paid out to creators as qualified earnings are not eligible for refund through the standard flow — that requires a dispute resolution with admin override and full audit trail.
- Platform fee percentage is **(configurable)**, applied at campaign funding time and locked to that campaign (a later fee change does not retroactively affect funded campaigns).

## Referrals

- A referral reward is `PENDING` until the referred account passes eligibility rules **(configurable)** — e.g., minimum account age, first successful campaign/payment.
- Self-referral (same verified device/payment fingerprint/email pattern as the referrer, within legally appropriate limits) blocks reward issuance and flags both accounts for review.
- Referral rewards have a global and per-user cap **(configurable)**; once reached, further referrals are tracked but do not generate rewards.

## Admin & audit

- Every mutation performed from `admin.domain.in` writes an `audit_logs` row with actor id, action, target type/id, before/after diff, and timestamp — no exceptions, including for `SUPER_ADMIN`.
- A `FINANCE_ADMIN` cannot suspend a user or approve campaign content; an `ADMIN`/`SUPPORT` cannot move money or change fee/referral rule configuration.
- Automatic fraud flags never result in an automatic permanent ban — they queue the account for human review (see [`referrals/REFERRAL_FRAUD_PROTECTION.md`](../referrals/REFERRAL_FRAUD_PROTECTION.md) and [`performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md)).
