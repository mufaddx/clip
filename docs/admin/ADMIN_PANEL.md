# Admin Panel

## Purpose

`admin.domain.in` is the platform team's complete operating console — not a read-only reporting view, but where campaigns get approved, money gets moved, fraud gets reviewed, and platform rules get configured.

## Dashboard home

Per [`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md): Total Users, Total Brands, Total Clippers, Active Campaigns, Total Campaign Budget, Platform Revenue, Total Qualified Performance, Pending Withdrawals as the stat row; User Growth and Campaign Performance charts; System Health, Revenue Overview, Recent Activity, Pending Actions, and Risk Alerts as supporting sections.

## Section inventory

- **User Management** — all users, filtered views for brands/clippers/admin team/suspended; suspend/reinstate actions.
- **Campaign Management** — full lifecycle visibility and the approval queue (see [`../campaigns/CAMPAIGN_LIFECYCLE.md`](../campaigns/CAMPAIGN_LIFECYCLE.md)).
- **Creator Management** — clipper verification status, performance history, and the risk-review queue (see [`../performance/QUALIFIED_PERFORMANCE.md`](../performance/QUALIFIED_PERFORMANCE.md)).
- **Instagram** — connected account inventory, connection health monitoring, error queue (see [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md)).
- **Performance** — overview dashboards, metric tracking, qualified performance rule configuration, suspicious activity queue.
- **Finance** — platform wallet, payments, earnings, withdrawals, refunds, transactions (see the whole [`../finance/`](../finance/WALLET_SYSTEM.md) domain).
- **Referral System** — overview, individual referrals, reward history, rule configuration (see [`../referrals/`](../referrals/REFERRAL_SYSTEM.md)).
- **Support, Disputes, Content Moderation** — see [`../operations/SUPPORT_SYSTEM.md`](../operations/SUPPORT_SYSTEM.md), [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md), [`MODERATION_SYSTEM.md`](MODERATION_SYSTEM.md).
- **Reports** — see [`../operations/REPORTING_SYSTEM.md`](../operations/REPORTING_SYSTEM.md).
- **Settings** — platform-wide configuration surfaces (fees, thresholds, feature flags).
- **Security** — audit logs and security events (see [`AUDIT_LOGS.md`](AUDIT_LOGS.md)).

## Access control

Every section above is gated by [`ADMIN_PERMISSIONS.md`](ADMIN_PERMISSIONS.md) — the sidebar itself is filtered per the logged-in admin's role, and the API independently re-checks on every request (see [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md)).

## Queue-driven UX

Sections with actionable backlogs (Pending Approval campaigns, Risk Review clippers, Suspicious Activity, flagged referrals, pending withdrawals) show a count badge in the sidebar — the admin's daily workflow is built around clearing these queues, not browsing static lists.

## Related documents

[`ADMIN_PERMISSIONS.md`](ADMIN_PERMISSIONS.md), [`AUDIT_LOGS.md`](AUDIT_LOGS.md), [`MODERATION_SYSTEM.md`](MODERATION_SYSTEM.md), [`../users/ADMIN_USER_FLOW.md`](../users/ADMIN_USER_FLOW.md).
