# Referral Rules

## Purpose

The specific, admin-configurable parameters governing when and how much a referral reward pays out — stored in a `referral_rules`/`system_settings` configuration, never hardcoded, editable from `admin.domain.in/referrals/rules`.

## Configurable parameters

| Parameter | Description |
|---|---|
| Reward type | `FIXED` (flat amount) or `PERCENTAGE` (of a defined base, e.g. referred user's first deposit or first earnings) |
| Reward amount / percentage | The value applied per the reward type |
| Eligibility rules | What the referred account must do before the reward is issuable — e.g. verify email, complete onboarding, complete a first successful campaign (brand) or first successful payout (clipper) |
| Maximum reward | A cap per individual reward, applied even if a percentage-based calculation would exceed it |
| Expiration | How long a `PENDING` referral can remain unfulfilled before it expires unrewarded (default configurable, e.g. 90 days) |
| Reward limits | A per-user cap on total referral rewards earnable (lifetime or per period), and optionally a global platform-wide cap |

## Versioning

Like `performance_rules` (see [`../performance/PERFORMANCE_SCORING.md`](../performance/PERFORMANCE_SCORING.md)), a change to referral rules creates a new version rather than editing in place — a referral already `PENDING` under an old rule set resolves against the rule version active when it was created, unless an admin explicitly migrates it.

## Enforcement points

- Reward issuance is blocked until **all** configured eligibility rules pass — checked by the Referral Reward Worker (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)), not the frontend.
- The per-user and global caps are checked at issuance time, inside the same transaction that would write the reward's `wallet_ledger` entry, to prevent a race from exceeding the cap.
- An expired `PENDING` referral is marked `EXPIRED`, not silently deleted — it remains visible in referral history for transparency.

## Related documents

[`REFERRAL_SYSTEM.md`](REFERRAL_SYSTEM.md), [`REFERRAL_FRAUD_PROTECTION.md`](REFERRAL_FRAUD_PROTECTION.md), [`../admin/ADMIN_PANEL.md`](../admin/ADMIN_PANEL.md).
