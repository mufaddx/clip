# CLIP — Documentation Index

This `/docs` directory is the **source of truth** for the CLIP platform. Code implements what is written here; when the two disagree, this documentation is updated first, then the code follows. Read the relevant document(s) before touching a module — do not rely on conversation history or memory of past decisions.

CLIP is a creator clipping, campaign distribution, performance tracking, and creator earnings platform connecting **Brands** (who fund campaigns) with **Clippers** (creators who publish content and earn based on verified performance), governed by a **Super Admin** platform team.

## How to use this documentation

1. Before building or changing a feature, read every doc listed under the relevant phase below.
2. If you make an architectural decision that isn't already documented, write it down here before or alongside the code change.
3. Cross-references use relative links — follow them; a document rarely stands alone.
4. Anything marked **(configurable)** means the value/rule lives in `system_settings` / an admin-editable table, never hardcoded.

## Map of the documentation

| Area | Path | Covers |
|---|---|---|
| Product | [`product/`](product/PRODUCT_OVERVIEW.md) | What CLIP is, who it's for, roles, journeys, business rules |
| Architecture | [`architecture/`](architecture/SYSTEM_ARCHITECTURE.md) | System, domain, app, backend, frontend, security, scaling, jobs, Meta integration |
| UI/UX | [`ui-ux/`](ui-ux/UI_UX_OVERVIEW.md) | Design system, tokens, components, navigation, page specs, UI states |
| Users | [`users/`](users/AUTHENTICATION_FLOW.md) | Auth, onboarding, and per-role flows |
| Campaigns | [`campaigns/`](campaigns/CAMPAIGN_SYSTEM.md) | Campaign lifecycle, creation, matching, reel submission/verification |
| Performance | [`performance/`](performance/PERFORMANCE_SYSTEM.md) | Metrics pipeline, snapshots, qualified performance, scoring |
| Finance | [`finance/`](finance/WALLET_SYSTEM.md) | Wallets, ledger, payments, earnings, withdrawals, refunds |
| Referrals | [`referrals/`](referrals/REFERRAL_SYSTEM.md) | Referral codes, rules, fraud protection |
| Database | [`database/`](database/DATABASE_SCHEMA.md) | Schema, relationships, migrations, retention |
| API | [`api/`](api/API_ARCHITECTURE.md) | REST architecture, endpoints, authorization, webhooks |
| Admin | [`admin/`](admin/ADMIN_PANEL.md) | Admin panel, permissions, audit logs, moderation |
| Operations | [`operations/`](operations/NOTIFICATION_SYSTEM.md) | Notifications, support, disputes, reporting, analytics |
| Development | [`development/`](development/DEVELOPMENT_RULES.md) | Rules, coding standards, folder structure, env setup, testing |
| Deployment | [`deployment/`](deployment/DEPLOYMENT_ARCHITECTURE.md) | Deployment topology, environments, domains, CI/CD |

## Current implementation status

This section is updated as work lands — treat it as the single "what actually exists" checklist, separate from the design intent described elsewhere in these docs.

- [x] Documentation structure (this Phase 0 pass)
- [x] Monorepo scaffold (Turborepo + pnpm workspaces): `public-web`, `clipper-app`, `brand-app`, `admin-app`, `api`, shared `packages/*`
- [x] Database schema (Prisma) for core tables
- [x] Cross-subdomain authentication skeleton (issue/verify JWT, role redirect, shared cookie), plus forgot/reset-password
- [x] Wallet/ledger backend (`apps/api/src/modules/wallet`) — every mutation (deposit, campaign lock/release, earning post/settle/reverse, withdrawal, refund, referral reward) is a paired, transactional `wallet_ledger` write
- [x] Campaign system backend (`apps/api/src/modules/campaigns`) — full lifecycle (draft → submit → approve/reject → fund → live → pause/resume → cancel/complete), creator matching + acceptance
- [x] Reel submission + a simplified rule-based verification pass (`apps/api/src/modules/reels`) — real Graph API media resolution not yet wired in
- [x] Instagram/Meta OAuth integration backend (`apps/api/src/modules/instagram`) — real Instagram API with Instagram Login flow, AES-256-GCM token encryption; untested end-to-end since no Meta app is configured yet
- [x] Performance pipeline backend (`apps/api/src/modules/performance`) — metric snapshots, versioned rule configuration, a simplified qualified-performance scoring formula, and inline earnings posting
- [x] Referral system backend (`apps/api/src/modules/referrals`) — attribution at signup, eligibility on onboarding completion, self-referral heuristic, per-user cap, expiration sweep
- [x] Notifications/support/disputes backend (`apps/api/src/modules/{notifications,support,disputes}`) — ticket/dispute lifecycles, dispute-driven ledger reversal
- [x] Admin backend (`apps/api/src/modules/admin`, `brands`) — user suspend/reinstate, admin-team provisioning, platform settings, brand team management; all admin mutations audit-logged
- [x] Background workers — partial: Notification Worker, Instagram Sync Worker, Referral Reward expiry sweep are real BullMQ workers (`apps/api/src/workers`) sharing the API's service layer via a standalone Nest application context. Reel Detection, Reel Verification, Metrics Sync, Performance Calculation, Campaign Progress, and Earnings currently run **inline** on the request path (see `ReelsService`, `PerformanceService`) rather than as queued workers — decoupling them is the next pass.
- [ ] Frontend pages beyond the dashboard shells — campaign wizard, wallet/withdrawals UI, Instagram connect UI, admin queues, etc. are still unbuilt; only the auth flow and dashboard-home shells are wired to real data shapes.
- [ ] End-to-end verification — none of this has been run (no Node.js/pnpm on this machine yet), so it's correct-by-construction, not test-verified. Run `pnpm install && pnpm db:migrate` first — see `docs/development/ENVIRONMENT_SETUP.md`.

Each unchecked item has a design already captured in its doc above; implementation follows in subsequent work sessions.
