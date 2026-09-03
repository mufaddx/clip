# Navigation Architecture

## Global pattern

Every dashboard app (clipper/brand/admin) uses the same frame: **Sidebar (left) + Header (top) + Main content area**, implemented once as `AppShell` in `@clip/ui` and configured per app with a different nav-item tree. See [`../architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md).

## Sidebar requirements

- **Active state**: current route's nav item is highlighted (indigo text/background tint) and expands its parent group if nested.
- **Collapsed state**: icon-only rail (tablet default, or user-toggled on desktop), with tooltips showing the label on hover.
- **Expandable navigation**: sections with sub-items (e.g. Clipper → Campaigns → Recommended/Available/Invited/Active/Submitted/Tracking/Completed) render as a disclosure group, not a flyout, so the structure is visible when expanded.
- **Permission-based items**: the nav tree is filtered server-side by the session's role/permissions before being sent to the client — a `BRAND_TEAM_MEMBER` without `team.invite` never sees a "Team" item rendered and hidden by CSS; it isn't rendered at all.
- **Responsive mobile mode**: becomes a full-height drawer over the content, opened by a header hamburger button, closed by backdrop tap or an explicit close button.

## Header requirements

Every dashboard header includes, left to right: (collapse/menu toggle) → page context (breadcrumb or app logo) → search → notifications bell (unread count badge) → help → user profile menu (avatar, name, role, settings link, logout).

## Per-app sidebar trees

### Clipper (`clipper.domain.in`)
Dashboard · Campaigns (Recommended, Available, Invited, Active, Submitted, Tracking, Completed) · My Instagram (Connected Accounts, Account Performance) · Analytics · Earnings · Wallet · Withdrawals · Referral Program · Notifications · Support · Profile · Settings.

### Brand (`brand.domain.in`)
Dashboard · Campaigns (All, Create, Drafts, Pending, Active, Paused, Completed) · Analytics · Creator Performance · Wallet (Overview, Add Funds, Transactions) · Billing (Payments, Invoices, Refunds) · Reports · Team Members · Notifications · Support · Profile · Settings.

### Admin (`admin.domain.in`)
Dashboard · User Management (All Users, Brands, Clippers, Admin Team, Suspended) · Campaign Management (All, Pending Approval, Active, Paused, Completed, Rejected) · Creator Management (All Clippers, Verification, Performance, Risk Review) · Instagram (Connected Accounts, Connection Health, Errors) · Performance (Overview, Metric Tracking, Qualified Performance, Suspicious Activity) · Finance (Platform Wallet, Payments, Earnings, Withdrawals, Refunds, Transactions) · Referral System (Overview, Referrals, Rewards, Rules) · Support · Disputes · Content Moderation · Reports · Notifications · Settings · Security (Audit Logs, Security Events).

## Route ↔ nav consistency

Every nav item corresponds to a real route defined in [`PAGE_SPECIFICATIONS.md`](PAGE_SPECIFICATIONS.md); a nav item is never added without its route, and a route is never shipped without appearing somewhere in navigation (no orphan pages reachable only by typing a URL, except detail pages reached by clicking into a list, which is expected).

## Related documents

[`RESPONSIVE_DESIGN.md`](RESPONSIVE_DESIGN.md), [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md), [`../product/USER_ROLES.md`](../product/USER_ROLES.md).
