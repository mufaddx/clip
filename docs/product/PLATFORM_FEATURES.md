# Platform Features

Feature inventory by application. "v1" = required for initial launch; "later" = designed for but not built in the first implementation pass.

## Public website (`domain.in`) — v1
Marketing pages, pricing, FAQ, login/signup, password reset, legal pages. See [`ui-ux/PAGE_SPECIFICATIONS.md`](../ui-ux/PAGE_SPECIFICATIONS.md).

## Clipper app (`clipper.domain.in`)
- v1: Dashboard home, campaign discovery (recommended/available/invited/active/submitted/tracking/completed), Instagram account connection, campaign detail + submission flow, analytics, earnings, wallet, withdrawals, referrals, notifications, support, profile/settings.
- later: multi-platform account connections (TikTok/YouTube), team collaboration for creator agencies.

## Brand app (`brand.domain.in`)
- v1: Dashboard home, campaign management (all states + create wizard), analytics, creator performance, wallet (overview/add funds/transactions), billing (payments/invoices/refunds), reports, team members, notifications, support, profile/settings.
- later: white-label reporting exports, campaign templates/duplication library.

## Admin app (`admin.domain.in`)
- v1: Dashboard, user management (all/brands/clippers/admin team/suspended), campaign management + approval queue, creator management (verification/performance/risk review), Instagram connection health, performance overview + rule configuration, finance (platform wallet/payments/earnings/withdrawals/refunds/transactions), referral system management, support, disputes, content moderation, reports, notifications, settings, security (audit logs/security events).
- later: configurable dashboards per admin role, scheduled report exports.

## Backend API (`api.domain.in`)
- v1: `/v1/auth`, `/v1/users`, `/v1/brands`, `/v1/clippers`, `/v1/campaigns`, `/v1/instagram`, `/v1/reels`, `/v1/metrics`, `/v1/performance`, `/v1/wallet`, `/v1/referrals`, `/v1/admin`.
- later: public partner API with API-key auth for brand-side integrations.

## Cross-cutting
- v1: role-based access control, audit logging, notification center (in-app + email), background job workers for sync/verification/calculation/earnings/notifications/referral rewards.
- later: push notifications, webhooks out to brand systems, multi-currency support.
