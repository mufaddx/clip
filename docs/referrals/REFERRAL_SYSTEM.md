# Referral System

## Purpose

Every eligible user gets a unique referral code and shareable link to grow the platform organically, with rewards that are provisional until eligibility and fraud checks clear.

## Code & link

Every `BRAND_OWNER` and `CLIPPER` account (not admin roles) receives a referral code at account creation, exposed as a link: `domain.in/signup?ref=ABC123`. The code is stored on `referrals` as the referrer's identity; visiting the link attributes the eventual signup to that code via a short-lived attribution cookie/query param carried through the signup flow.

## Reward flow

```
Referral link shared → new user registers with ?ref=CODE in the URL
        ↓
Referral attribution recorded (referrals row: referrer, referred_user, status=PENDING)
        ↓
Eligibility conditions checked (configurable — e.g., referred account verifies email,
completes onboarding, and/or completes a first successful campaign/payment)
        ↓
Referral verification (fraud screening, see REFERRAL_FRAUD_PROTECTION.md)
        ↓
Reward generated (referral_rewards row + wallet_ledger CREDIT once approved)
```

## Referral dashboard

`clipper.domain.in/referrals` and `brand.domain.in` (wherever referrals apply to brands) show: Total Referrals, Pending Referrals, Successful Referrals, Referral Earnings, and a Reward History list with each referral's current status.

## Reward types

Configurable per [`REFERRAL_RULES.md`](REFERRAL_RULES.md) — a fixed amount, a percentage (e.g., of the referred user's first campaign spend or first earnings), or both, with caps.

## Related documents

[`REFERRAL_RULES.md`](REFERRAL_RULES.md), [`REFERRAL_FRAUD_PROTECTION.md`](REFERRAL_FRAUD_PROTECTION.md), [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md).
