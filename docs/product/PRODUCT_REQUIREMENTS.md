# Product Requirements

## Functional requirements (by domain)

### Authentication & Identity
- Email/password signup and login with email verification before full access.
- Password reset via time-limited signed token.
- Single account = single role family (brand or clipper); admin roles assigned out-of-band.
- Session must be valid across `domain.in`, `clipper.domain.in`, `brand.domain.in`, `admin.domain.in` without re-login.

### Onboarding
- Role selection is the first signup step and is irreversible without admin intervention.
- Multi-step onboarding wizard with resumable progress (see [`users/ONBOARDING_FLOW.md`](../users/ONBOARDING_FLOW.md)).
- A user with incomplete onboarding is routed back into the wizard on every login until complete.

### Campaigns
- Brands create campaigns through a 6-step wizard (see [`campaigns/CAMPAIGN_CREATION_FLOW.md`](../campaigns/CAMPAIGN_CREATION_FLOW.md)) ending in admin review before going live.
- Campaigns must be funded (budget locked in the brand wallet) before they can leave `PENDING_REVIEW` → `APPROVED` → `LIVE`.
- Campaign objectives are configurable per campaign (views, reach, engagement, quality performance) — never hardcoded to "views only."
- Clippers only see campaigns they are eligible for, ranked by a matching score (see [`campaigns/CREATOR_MATCHING.md`](../campaigns/CREATOR_MATCHING.md)).

### Instagram Integration
- Account connection via Meta OAuth only — no credential collection, no scraping.
- Reel identification either by webhook/media-sync detection or manual URL submission, always followed by ownership + rule verification.
- Metrics availability adapts to what the connected account's permissions actually expose.

### Performance
- Raw metrics are stored as immutable snapshots, never overwritten.
- Qualified Performance is computed by a configurable rule engine, auditable back to the raw snapshot that produced it.

### Finance
- No balance is ever mutated directly; every change is a ledger entry that a balance is derived from or reconciled against.
- Withdrawals go through a request → review → processing → paid state machine (see [`finance/WITHDRAWAL_SYSTEM.md`](../finance/WITHDRAWAL_SYSTEM.md)).

### Referrals
- Every user gets a unique referral code and shareable link at account creation.
- Reward issuance requires passing configurable eligibility rules and fraud screening before it posts to the wallet.

### Admin
- Every state-changing admin action writes an audit log entry (actor, action, target, before/after, timestamp).
- Permission-gated: `FINANCE_ADMIN` cannot moderate content; `SUPPORT` cannot alter financial rules.

## Non-functional requirements

- **Security**: all authorization decisions are re-verified server-side regardless of what the frontend already checked; secrets never reach the browser.
- **Auditability**: financial and admin actions must be reconstructable from stored history alone.
- **Resilience**: background jobs (metric sync, verification, payouts) must be retryable and idempotent — a retried job must not double-pay or double-count.
- **Performance**: dashboard pages target sub-1s perceived load via server-rendered shells + streamed data; heavy aggregation is precomputed by workers, not calculated on request.
- **Accessibility**: all interactive components meet WCAG 2.1 AA (contrast, keyboard nav, focus states) — see [`ui-ux/DESIGN_SYSTEM.md`](../ui-ux/DESIGN_SYSTEM.md).
- **Internationalization readiness**: currency and date formatting are centralized utilities, not inlined, even though the initial launch targets a single currency/locale.
- **Configurability over hardcoding**: performance formulas, referral rules, and fee structures live in admin-editable settings, not source code constants.

## Out of scope for v1

- Native mobile apps (responsive web only, see [`ui-ux/RESPONSIVE_DESIGN.md`](../ui-ux/RESPONSIVE_DESIGN.md)).
- Platforms other than Instagram (architecture should not preclude adding TikTok/YouTube later, but v1 ships Instagram-only).
- Real-time push notifications (in-app + email now; push is a documented future channel, see [`operations/NOTIFICATION_SYSTEM.md`](../operations/NOTIFICATION_SYSTEM.md)).
