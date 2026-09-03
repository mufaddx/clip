# Clipper User Flow

## Scope

Screen-by-screen flow for a `CLIPPER` from first login through earning and withdrawing, on `clipper.domain.in`.

## Flow

1. **Login** → redirected per [`AUTHENTICATION_FLOW.md`](AUTHENTICATION_FLOW.md) → onboarding if incomplete ([`ONBOARDING_FLOW.md`](ONBOARDING_FLOW.md)) → else `/dashboard`.
2. **Dashboard (empty state)** — no Instagram connected / no campaigns accepted yet: prompts to connect Instagram and browse Available campaigns.
3. **Browse campaigns** — `/campaigns/available` and `/campaigns/recommended` (matching-ranked, see [`../campaigns/CREATOR_MATCHING.md`](../campaigns/CREATOR_MATCHING.md)); campaign cards show payout structure, requirements summary, and eligibility.
4. **Campaign detail** (`/campaigns/[id]`) — Overview, Instructions, Content Assets, Requirements, Publishing Rules tabs read before accepting.
5. **Accept campaign** — blocked server-side if Instagram isn't connected or eligibility isn't met; on success, campaign moves to the clipper's `/campaigns/active` list.
6. **Publish** — clipper publishes approved content on their own Instagram per the campaign's instructions.
7. **Submit** — either the Reel Detection Worker finds the published media automatically, or the clipper submits the reel URL directly on the campaign's Submission tab (see [`../campaigns/REEL_SUBMISSION.md`](../campaigns/REEL_SUBMISSION.md)).
8. **Verification** — submission is validated against campaign rules (see [`../campaigns/REEL_VERIFICATION.md`](../campaigns/REEL_VERIFICATION.md)); status visible on the campaign detail page (`Pending Verification`, `Verified`, `Rejected` with reason).
9. **Tracking** — verified reels move to `/campaigns/tracking`; performance accrues over the campaign's tracking window, visible on the campaign's Performance tab.
10. **Earnings posted** — once the tracking window closes, qualified performance converts to earnings, posted `PENDING` then `AVAILABLE` in `/earnings` and `/wallet` (see [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md)).
11. **Withdraw** — `/withdrawals`, request against `AVAILABLE` balance, tracked through to payment (see [`../finance/WITHDRAWAL_SYSTEM.md`](../finance/WITHDRAWAL_SYSTEM.md)).
12. **Ongoing** — `/referrals` for referral earnings, `/analytics` for cross-campaign trends, independent of any single campaign.

## Decision points requiring confirmation

- Accepting a campaign (may count against the clipper's concurrent-campaign limit if one is configured).
- Submitting a reel URL (locks that submission to this campaign — cannot be reassigned to another).
- Requesting a withdrawal (moves funds from `AVAILABLE` to `PROCESSING` immediately).

## Related documents

[`../campaigns/CAMPAIGN_SYSTEM.md`](../campaigns/CAMPAIGN_SYSTEM.md), [`../campaigns/REEL_SUBMISSION.md`](../campaigns/REEL_SUBMISSION.md), [`../performance/PERFORMANCE_SYSTEM.md`](../performance/PERFORMANCE_SYSTEM.md), [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md).
