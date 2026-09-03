# Product Overview

## Purpose

CLIP is a two-sided marketplace that connects **Brands** who want their content distributed by real creators with **Clippers** (creators) who publish that content on their own Instagram accounts and get paid based on verified, qualified performance — not vanity view counts.

CLIP sits between "influencer marketing agency" and "self-serve ad platform": brands get campaign tooling, creator discovery, and performance reporting without manual outreach; clippers get a marketplace of paid campaigns matched to their audience, with transparent, auditable earnings.

## Who it's for

- **Brands** — companies, agencies, and individual creators/companies who want short-form video (primarily Instagram Reels) distributed at scale by a network of clippers, and want to pay only for verified, qualifying performance.
- **Clippers** — creators who publish approved content to their own Instagram account and earn money based on the performance that content generates, measured through official Meta/Instagram APIs.
- **Platform team** (Super Admin, Admin, Support, Finance Admin) — operate the marketplace: approve campaigns, resolve disputes, manage payouts, monitor fraud/risk, and configure platform-wide rules.

## What CLIP is not

- Not a scraping tool. All Instagram data comes through official Meta Graph API permissions the connected account has granted — see [`architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md).
- Not a flat pay-per-view service. Raw views are one input into a configurable **Qualified Performance** calculation — see [`performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md).
- Not a single monolithic dashboard. It is four purpose-built applications on role-specific subdomains sharing one backend and one design system — see [`architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md).

## Core value loop

```
Brand funds a campaign
        ↓
Clippers discover and accept the campaign
        ↓
Clippers publish approved content on Instagram
        ↓
CLIP tracks performance via the Meta Graph API
        ↓
Performance is validated against campaign rules → Qualified Performance
        ↓
Creator earnings are calculated and posted to the creator wallet
        ↓
Brand sees real, verified campaign results; Creator withdraws earnings
```

This loop is the spine of the whole platform — every other feature (referrals, notifications, disputes, admin tooling) exists to support, protect, or report on this loop.

## Product pillars

1. **Campaign Distribution** — brands reach an existing network of creators instead of building one from scratch per campaign.
2. **Creator Network** — clippers get a steady stream of campaigns matched to their content categories and account performance, not a flat marketplace everyone spams.
3. **Verified Performance** — every metric traces back to an official API snapshot, never a self-reported number.
4. **Transparent Earnings** — every balance change is a ledger entry; nothing is ever "just updated."
5. **Trust & Safety** — fraud detection on referrals and performance, disputes with evidence, and full admin audit trails.

## Related documents

- [`PRODUCT_REQUIREMENTS.md`](PRODUCT_REQUIREMENTS.md) — functional/non-functional requirements
- [`USER_ROLES.md`](USER_ROLES.md) — role definitions and permission boundaries
- [`USER_JOURNEYS.md`](USER_JOURNEYS.md) — end-to-end journeys per role
- [`BUSINESS_RULES.md`](BUSINESS_RULES.md) — rules that must never live only in the frontend
- [`PLATFORM_FEATURES.md`](PLATFORM_FEATURES.md) — full feature inventory by application
