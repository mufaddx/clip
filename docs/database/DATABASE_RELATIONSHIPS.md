# Database Relationships

## Purpose

The entity relationship map underlying [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md), showing how the major subsystems connect.

## Core identity cluster

```
users ──1:1── brand_profiles / creator_profiles / admin_profiles (exactly one, based on primary role)
users ──1:N── user_roles ──N:1── roles ──N:M── permissions
brand_profiles ──1:N── team_members ──N:1── users (the team member's own user row)
```

## Campaign cluster

```
brand_profiles ──1:N── campaigns
campaigns ──1:N── campaign_assets
campaigns ──1:1── campaign_requirements
campaigns ──1:N── campaign_creators ──N:1── creator_profiles
campaigns ──1:N── campaign_invitations ──N:1── creator_profiles
campaign_creators ──1:N── campaign_reels
campaign_reels ──1:N── reel_verifications (history of verification attempts)
campaign_reels ──1:N── reel_metrics (latest-known, typically one active row)
campaign_reels ──1:N── metric_snapshots (full immutable history)
campaign_reels ──1:N── performance_calculations ──N:1── performance_rules
```

## Instagram cluster

```
creator_profiles ──1:N── instagram_accounts ──1:1── instagram_tokens
```

A creator can connect multiple Instagram accounts over time (e.g., reconnecting after a revoke), but only one is `is_primary`/active per campaign acceptance.

## Finance cluster

```
users ──1:1── wallets
wallets ──1:N── wallet_ledger
wallet_ledger ──N:1── transactions (grouping)
wallet_ledger ──0:1── payments (when the entry originated from a provider event)
wallets ──1:N── withdrawals ──1:1── payouts
wallets ──1:N── refunds (optionally referencing a campaigns row)
```

## Referral cluster

```
users (referrer) ──1:N── referrals ──N:1── users (referred)
referrals ──1:1── referral_rewards
```

## Operations cluster

```
users ──1:N── support_tickets ──1:N── ticket_messages
disputes ──0:1── campaigns, campaign_reels, payments (polymorphic reference to what's disputed)
disputes ──1:N── dispute_messages
users (admin) ──1:N── audit_logs (action trail, target is a polymorphic reference)
```

## Cross-cluster integrity rules

- A `campaign_creators` row cannot exist without its `campaigns` row being at least `LIVE` at the time of creation (enforced in the service layer, not just a nullable FK).
- A `performance_calculations` row always references the exact `performance_rules.id` (version) active when it ran — never "the current rules," which would break historical reproducibility.
- A `wallet_ledger` entry that represents one half of a two-sided movement (e.g., campaign funding: brand `AVAILABLE`→`LOCKED`) shares a `related_transaction_id` with its counterpart, so the pair can always be reassembled.

## Related documents

[`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md), [`../finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md), [`../performance/PERFORMANCE_SCORING.md`](../performance/PERFORMANCE_SCORING.md).
