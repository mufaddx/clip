# Campaign Creation Flow

## Purpose

The step-by-step wizard a brand uses at `brand.domain.in/campaigns/create`. State is saved as `DRAFT` after every step so a brand can leave and resume (mirrors the resumability principle in [`../users/ONBOARDING_FLOW.md`](../users/ONBOARDING_FLOW.md)).

## Step 1 — Basic Information

Campaign Name, Campaign Type, Category, Description, Objective (feeds Step 4's available targets).

## Step 2 — Content

Video upload (supports multiple assets), captions, hashtags, required mentions, publishing instructions for the clipper. Assets are stored and referenced by `campaign_assets`; large media uploads go through a signed upload URL, not through the API request body.

## Step 3 — Creator Requirements

Target categories, minimum account requirements (follower count, account age, trust score — all **(configurable)** platform-wide defaults the brand can tighten but not loosen below platform minimums), content restrictions, maximum participants.

## Step 4 — Performance Targets

Configurable objective selection — **not assumed to be raw views**:

- Distribution (number of creators / reach breadth)
- Views
- Reach
- Engagement (likes/comments/shares/saves composite)
- Quality Performance (the Qualified Performance score itself, see [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md))

The objective selected here determines which `performance_rules` configuration applies to this campaign's reels.

## Step 5 — Budget

Creator Budget (the pool paid out to clippers), Platform Fee (percentage, locked at current rate for this campaign), Estimated Cost, Required Funding, Total Campaign Budget (creator budget + fee). The wizard shows the arithmetic transparently — no hidden fees appear later.

## Step 6 — Review

Full read-only summary of all five prior steps with an edit-this-step shortcut per section, then "Submit for Review" — transitions the campaign from `DRAFT` to `SUBMITTED` (see [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md)).

## Validation rules

- Steps 1–3 must be complete before Step 4 is reachable (progressive validation, not all-at-once at the end).
- Step 5's Total Campaign Budget must be funded (or fundable) before Step 6's submit is enabled if the platform requires funding-at-submission; if funding-after-approval is the configured flow, submission is allowed unfunded and funding is prompted after admin approval (see [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md) for which applies).
- Every validation is re-checked server-side on submission — the wizard's step gating is UX only.

## Related documents

[`CAMPAIGN_SYSTEM.md`](CAMPAIGN_SYSTEM.md), [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md), [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md) (`StepWizard`).
