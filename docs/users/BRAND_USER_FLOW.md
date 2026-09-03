# Brand User Flow

## Scope

Screen-by-screen flow for a `BRAND_OWNER`/`BRAND_TEAM_MEMBER` from first login through running a campaign to completion, on `brand.domain.in`.

## Flow

1. **Login** → redirected per [`AUTHENTICATION_FLOW.md`](AUTHENTICATION_FLOW.md) → if onboarding incomplete, into [`ONBOARDING_FLOW.md`](ONBOARDING_FLOW.md); else `/dashboard`.
2. **Dashboard (empty state)** — no campaigns yet: stat row shows zeros, primary CTA is "Create Campaign" (see [`../ui-ux/EMPTY_STATES.md`](../ui-ux/EMPTY_STATES.md)).
3. **Create Campaign** (`/campaigns/create`) — 6-step wizard per [`../campaigns/CAMPAIGN_CREATION_FLOW.md`](../campaigns/CAMPAIGN_CREATION_FLOW.md), ending in `Submitted` status.
4. **Awaiting review** — campaign shows `PENDING_REVIEW` in `/campaigns`; brand can edit or withdraw the submission while pending.
5. **Approved, unfunded** — campaign shows `APPROVED`, dashboard prompts "Add funds to launch" linking to `/wallet/add-funds`.
6. **Funding** — brand adds funds; once `locked_budget == total_budget`, the campaign auto-transitions toward `LIVE` (see [`../campaigns/CAMPAIGN_LIFECYCLE.md`](../campaigns/CAMPAIGN_LIFECYCLE.md)).
7. **Live** — clippers accept and publish; brand's `/campaigns/[id]` shows real-time participant count, spend, and qualified performance; `/creators` shows per-creator breakdown.
8. **Pause / resume** — brand can pause a live campaign (stops new acceptances, existing tracked reels keep tracking through their window); resuming re-opens acceptance.
9. **Completion** — campaign reaches its end condition (budget exhausted, end date, or manual completion); brand reviews final results in `/reports`, can export.
10. **Ongoing** — brand manages `/team`, `/billing`, and `/wallet/transactions` throughout, independent of any single campaign's lifecycle.

## Decision points requiring confirmation

- Funding a campaign (moves real money from brand wallet to locked budget).
- Pausing a campaign (a modal explains that locked-but-unspent budget stays locked, not refunded, while paused).
- Removing a team member (revokes their access immediately).

## Related documents

[`../campaigns/CAMPAIGN_CREATION_FLOW.md`](../campaigns/CAMPAIGN_CREATION_FLOW.md), [`../campaigns/CAMPAIGN_LIFECYCLE.md`](../campaigns/CAMPAIGN_LIFECYCLE.md), [`TEAM_MEMBER_FLOW.md`](TEAM_MEMBER_FLOW.md), [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md).
