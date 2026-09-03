# Referral Fraud Protection

## Purpose

Referral rewards are real money — this document defines what CLIP detects and, critically, what it deliberately does **not** do automatically (permanently ban on a single signal).

## Signals detected

- **Self-referral** — the referred account shares identity signals with the referrer (same verified email pattern/domain trick, same payment method fingerprint, same device signal where legally and technically appropriate to collect) beyond plausible coincidence.
- **Duplicate accounts** — multiple accounts created in a short window from the same device/network fingerprint referring each other in a cycle.
- **Suspicious referral patterns** — an abnormal volume of referrals from one referrer in a short period, or referrals that all fail to progress past signup (consistent with fabricated accounts).
- **Repeated device signals** — the same device associated with an unusual number of distinct referred accounts, collected and used only where legally and technically appropriate (respecting applicable privacy law and the platform's own privacy policy — device fingerprinting scope is a legal/policy decision made outside this document, but the fraud system is built to consume such a signal if and when it's available).
- **Abnormal reward behavior** — reward velocity per user far exceeding typical patterns, or referrals concentrated suspiciously close to reward-rule boundary values (e.g., always just under a cap).

## What happens on a flag

```
Signal detected → referral (and both accounts involved) flagged for review
        ↓
Reward issuance is held (not paid, not auto-denied)
        ↓
Queued to admin.domain.in/referrals (flagged view)
        ↓
Admin reviews evidence → Approve (release reward) or Deny (mark referral fraudulent, no reward)
        ↓
Repeated confirmed fraud on an account may lead to account-level action (suspension), decided
by an admin using the standard user-management tools — never triggered automatically by the
fraud detector itself
```

**No automatic signal results in a permanent ban.** Automated detection only ever produces a hold-for-review state; every consequential action (denying a reward, suspending an account) is a deliberate human decision by an admin, logged to [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md).

## Related documents

[`REFERRAL_SYSTEM.md`](REFERRAL_SYSTEM.md), [`REFERRAL_RULES.md`](REFERRAL_RULES.md), [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md) (the equivalent risk-review pattern for performance fraud), [`../admin/MODERATION_SYSTEM.md`](../admin/MODERATION_SYSTEM.md).
