# Admin User Flow

## Scope

Flow for `SUPER_ADMIN`/`ADMIN`/`SUPPORT`/`FINANCE_ADMIN` on `admin.domain.in`. Unlike brand/clipper, admin accounts are never self-service signups.

## Provisioning

A `SUPER_ADMIN` creates the account from `/users/admin-team` (email + role assignment); the invitee receives a set-password link, sets their password, and logs in directly to `admin.domain.in` — there is no admin onboarding wizard, just role-scoped dashboard access from first login.

## Flow

1. **Login** → role validated → `admin.domain.in/dashboard` (see [`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md)).
2. **Triage queues** — `/campaigns/pending-approval`, `/clippers/verification`, `/clippers/risk-review`, `/performance/suspicious-activity`, `/referrals` flagged cases, `/finance/withdrawals` pending review: each queue shows count badges in the sidebar so an admin's daily loop starts by clearing what's outstanding.
3. **Campaign approval** — open a submitted campaign, review content/requirements/budget against [`../campaigns/CAMPAIGN_RULES.md`](../campaigns/CAMPAIGN_RULES.md), Approve or Reject with a required reason (shown to the brand).
4. **Support & disputes** — `/support` and `/disputes` ticket queues, assignable, with full context pulled from the relevant campaign/wallet/reel records (read-only for `SUPPORT`, actionable per-permission for `ADMIN`/`FINANCE_ADMIN`).
5. **Finance actions** (`FINANCE_ADMIN`/`SUPER_ADMIN` only) — approve/process withdrawals, review refund requests, adjust referral reward rules.
6. **Moderation** — `/moderation` for flagged campaign content or reel submissions.
7. **Configuration** (`SUPER_ADMIN` only) — `/settings`, performance rule weights, referral rules, fee structure — every change here versions the prior config rather than overwriting it silently (see [`../performance/PERFORMANCE_SCORING.md`](../performance/PERFORMANCE_SCORING.md)).
8. **Security** — `/security/audit-logs` and `/security/security-events` for reviewing the trail every admin action leaves.

## Permission boundaries in practice

- `SUPPORT` opening `/finance/withdrawals` sees a 403/permission-denied state, not the data — see [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md).
- `FINANCE_ADMIN` cannot approve/reject a campaign's content, only its funding-related state.
- Every action taken from any admin screen writes to `/security/audit-logs` regardless of role, including `SUPER_ADMIN` actions.

## Related documents

[`../admin/ADMIN_PANEL.md`](../admin/ADMIN_PANEL.md), [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md), [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md).
