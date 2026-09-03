# Campaign System

## Purpose

The campaign is the core unit of value exchange in CLIP: a brand's funded request for creator-published content, matched to eligible clippers, tracked for performance, and settled into creator earnings. Every other system (matching, reels, performance, wallet) exists to serve a campaign's lifecycle.

## Core entities

- `campaigns` — the campaign itself: name, type, category, objective, budget, status, timing.
- `campaign_assets` — uploaded video/image assets, captions, hashtags, required mentions, instructions.
- `campaign_requirements` — creator eligibility rules (categories, account minimums, content restrictions, max participants).
- `campaign_creators` — join table: which clippers accepted this campaign, when, and their per-campaign status.
- `campaign_invitations` — for campaigns targeted at specific clippers rather than open acceptance.
- `campaign_reels` — the submitted/detected reel(s) tied to a `campaign_creators` row.

See [`../database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md) for full column definitions.

## Lifecycle summary

`DRAFT → SUBMITTED → PENDING_REVIEW → APPROVED → FUNDED → LIVE → PAUSED ⇄ LIVE → COMPLETED`, with `REJECTED`, `CANCELLED`, `EXPIRED` as terminal off-ramps. Full state machine and transition rules: [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md).

## Creation

A 6-step wizard on `brand.domain.in/campaigns/create`: Basic Information, Content, Creator Requirements, Performance Targets, Budget, Review. Full spec: [`CAMPAIGN_CREATION_FLOW.md`](CAMPAIGN_CREATION_FLOW.md).

## Matching

Not every campaign is shown to every clipper — eligibility + a ranking score determine what appears in Recommended vs. Available. Full spec: [`CREATOR_MATCHING.md`](CREATOR_MATCHING.md).

## Reel submission & verification

Once a clipper publishes, content is identified either automatically or by manual submission, then validated against the campaign's publishing rules before it counts toward performance. Full specs: [`REEL_SUBMISSION.md`](REEL_SUBMISSION.md), [`REEL_VERIFICATION.md`](REEL_VERIFICATION.md).

## Rules enforcement

Business rules governing campaign state transitions, budget, and participation caps live in [`CAMPAIGN_RULES.md`](CAMPAIGN_RULES.md) and are enforced in the `campaigns` service module (see [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md)), never only in the wizard UI.

## Downstream systems

A campaign's tracked reels feed [`../performance/PERFORMANCE_SYSTEM.md`](../performance/PERFORMANCE_SYSTEM.md), whose output feeds [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md); a campaign's funding/spend feeds [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md).
