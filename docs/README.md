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
- [x] Admin backend (`apps/api/src/modules/admin`, `brands`) — user suspend/reinstate, admin-team provisioning, platform settings, brand team management, audit-log/security-event read endpoints; all admin mutations audit-logged
- [x] Analytics + Moderation backends (`apps/api/src/modules/analytics`, `moderation`) — live-computed brand/clipper/platform overviews; the MANUAL_REVIEW content queue and admin decide action
- [x] Payments module (`apps/api/src/modules/payments`) — real, complete webhook signature verification (HMAC-SHA256 over the raw body) + normalized event dispatch to the wallet; the actual provider API calls (create-intent, payout) are a deliberate `503 PAYMENTS_NOT_CONFIGURED` stub until a specific provider (Razorpay/Stripe/etc.) is chosen — see the TODOs in `PaymentsService`
- [x] Meta webhook handler (`InstagramController` `/webhook`) — verification handshake + signed event receipt; doesn't yet enqueue a Reel Detection job on receipt (the worker instead polls on a schedule)
- [x] Brand team permission enforcement (`PermissionsGuard` + `@RequirePermission`) — a `BRAND_TEAM_MEMBER` without `CAMPAIGNS_APPROVE_BUDGET` can build a campaign but not fund it; fixed a related bug where funding/cancelling as a team member would have failed (wallet lookups now correctly resolve to the brand owner's wallet, not the acting team member's)
- [x] Reel object-level access scoping (clipper/brand/staff only, previously open to any authenticated user)
- [x] Background workers — 6 of 9 documented workers are real BullMQ workers sharing the API's service layer via a standalone Nest application context (`apps/api/src/worker.ts`): Instagram Sync, Reel Detection, Metrics Sync, Earnings, Notification, Referral Reward expiry. Reel Verification is deliberately inline (fast, local, nothing external to decouple); Campaign Progress is deliberately live-computed by `AnalyticsService` rather than cached (see `docs/architecture/SCALABILITY_ARCHITECTURE.md` — caching it is "the first thing to revisit" once this stops being fast enough, not before).
- [x] Infra scaffolding — `docker-compose.yml` (local Postgres+Redis), shared ESLint preset (`packages/config/eslint-preset.js`) wired into every app, a GitHub Actions CI workflow (`.github/workflows/ci.yml`) running typecheck/lint/migrate/test/build against real service containers
- [x] First test suite (`apps/api/test/wallet.service.spec.ts`) — covers the ledger's highest-priority invariants per `docs/development/TESTING_STRATEGY.md` (balanced two-sided moves, insufficient-balance rejection, non-positive-amount rejection). Everything else in the testing strategy (integration tests against a real Postgres, API-level role-matrix tests, concurrency/race tests) is still unwritten.
- [x] Fixed a critical signup bug: `AuthService.register` created a `User` + `Wallet` but never a `BrandProfile`/`CreatorProfile` — every campaign/reel service call resolves ownership through those rows, so campaign creation would have failed for every fresh signup. Now created immediately at registration (minimal defaults); onboarding refines the fields rather than creating the row.
- [x] Self-profile endpoints (`GET/PATCH /v1/brands/me`, `GET/PATCH /v1/clippers/me`) — didn't exist; needed for onboarding to actually save anything.
- [x] `ClippersModule` — didn't exist as a module at all before this pass.
- [x] Admin-wide campaign listing (`GET /v1/admin/campaigns`) and referral listing/decision (`GET /v1/referrals/all`, `PATCH /v1/referrals/:id/decide`) — needed by the admin queue pages; didn't exist before.
- [x] Real onboarding wizards for both brand and clipper apps (previously one-sentence placeholders) — save to the profile endpoints above and mark onboarding complete.
- [x] Frontend build-out across all four apps — this was the largest remaining gap and is now substantially closed:
  - **public-web**: every documented marketing/legal page (`/about`, `/how-it-works`, `/for-brands`, `/for-clippers`, `/categories`, `/pricing`, `/faq`, `/contact`, `/privacy`, `/terms`) plus the forgot/reset-password flow that login linked to but never had a page.
  - **clipper-app**: campaign browse (all 7 tabs) + detail/accept/submit, Instagram connect UI, wallet, withdrawals, earnings, analytics, referrals, notifications, support, profile/settings — all wired to real endpoints.
  - **brand-app**: the full 6-step campaign creation wizard, campaign list/detail with lifecycle actions (submit/fund/pause/resume/cancel/complete), per-campaign and cross-campaign creator performance, wallet (overview/add-funds/transactions), billing, reports, team management, analytics, notifications, support, profile/settings.
  - **admin-app**: user management (all/brands/clippers/admin-team/suspended) with suspend/reinstate + admin invite, campaign approval queue, clipper risk-review, Instagram connection health, qualified-performance rule editor, withdrawal processing queue, referral overview/list/rewards/rules, support/disputes/moderation queues, audit-logs/security-events, platform settings.
  - Five sub-pages are honest stubs rather than fake-functional, each saying exactly why: `/billing/invoices` and admin `/reports`/`/finance/{platform-wallet,payments,earnings,refunds,transactions}` need dedicated admin-wide listing endpoints or a PDF/export pipeline that don't exist yet; `/performance/{metric-tracking,suspicious-activity}` need dedicated detail views. The public `/contact` page links to email rather than faking a form against a backend that requires an authenticated user.
  - Added `@clip/ui` Table, Tabs, form (Field/Input/Textarea/Select/Checkbox), and Modal components to support all of the above.
- [x] **End-to-end verified, for real** — Docker Desktop and a real Postgres/Redis became available mid-session, so this stopped being "correct-by-construction" and got actually run:
  - `packages/db/prisma/migrations/20260903183421_init` — the first-ever migration, generated by diffing the hand-written schema against a real Postgres and applied cleanly (zero errors across ~40 tables, enums, and relations). Applied to both a local Docker Postgres and the project's real Supabase instance (pooled `DATABASE_URL` + direct `DIRECT_URL` for migrations, per Supabase's Prisma guidance).
  - `pnpm db:seed` ran successfully against both.
  - `pnpm typecheck` — clean across all 5 typed packages after fixing real bugs `tsc` caught: two `noUncheckedIndexedAccess` bugs in `useState(OBJECTIVES[1])` call sites (brand campaign wizard, admin rule editor), an `apps/api/tsconfig.json` `rootDir` misconfiguration that rejected cross-workspace-package imports, Prisma's strict nullable-`Json` input typing in `audit.service.ts`/`notifications.service.ts`, an unsafe array-destructure in `referrals.service.ts`, and the `Record<string,...>` dynamic-field-access pattern in `wallet.service.ts` (extracted into a documented `readBucket()` helper).
  - `pnpm lint` — clean across all 5 packages after fixing 2 JSX unescaped-apostrophe errors and 1 unused import; also added the missing `eslint-config-next` dependency each app's `.eslintrc.json` referenced but never declared.
  - `pnpm test` — all 3 wallet-ledger tests pass.
  - `pnpm build` — all 5 packages build successfully, including a real bug typecheck couldn't see: Next.js forbids `next/headers` in any module a Client Component's bundle touches, even transitively, and every app's `lib/api-client.ts` exported both the server (`apiFetch`, uses `next/headers`) and client (`apiFetchClient`) functions from one file. Split into `api-client.ts` (client-only) + `api-client.server.ts` (server-only) in all three dashboard apps, ~11 call sites repointed.
  - Chained `typecheck && lint && test && build` end to end — all green.
- [ ] Never run against a live browser/UI — the dev servers themselves (`pnpm dev`) haven't been started and clicked through; build success proves the code compiles and bundles correctly, not that every interaction behaves as intended.
- [ ] Real chart rendering — analytics/performance trend views currently render as plain lists/tables rather than charts; wiring a real charting library (per the `dataviz` conventions) is a follow-up.
- [ ] Payment provider integration — still a `503` stub (see `PaymentsService`); needs a specific provider chosen before it can move money for real.

Each unchecked item has a design already captured in its doc above; implementation follows in subsequent work sessions.
