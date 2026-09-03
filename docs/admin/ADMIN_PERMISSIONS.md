# Admin Permissions

## Purpose

Precise permission boundaries for the four admin-side roles, enforced by `RolesGuard`/`PermissionsGuard` on every relevant API route (see [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md)) and mirrored by sidebar filtering in `admin-app`.

## Role capability matrix

| Capability | `SUPER_ADMIN` | `ADMIN` | `SUPPORT` | `FINANCE_ADMIN` |
|---|---|---|---|---|
| View all users/brands/clippers | ✓ | ✓ | ✓ (read-only) | ✓ (read-only) |
| Suspend/reinstate users | ✓ | ✓ | – | – |
| Approve/reject campaigns | ✓ | ✓ | – | – |
| Review clipper verification/risk | ✓ | ✓ | – | – |
| View Instagram connection health | ✓ | ✓ | ✓ (read-only) | – |
| Configure performance rules | ✓ | – | – | – |
| View performance/suspicious activity | ✓ | ✓ | ✓ (read-only) | – |
| View platform wallet/transactions | ✓ | – | – | ✓ |
| Process withdrawals/refunds | ✓ | – | – | ✓ |
| Configure fees | ✓ | – | – | – |
| View/manage referrals | ✓ | ✓ | – | ✓ (rewards only) |
| Configure referral rules | ✓ | – | – | – |
| Handle support tickets | ✓ | ✓ | ✓ | – |
| Handle disputes | ✓ | ✓ | ✓ (triage) | ✓ (financial resolution) |
| Content moderation actions | ✓ | ✓ | – | – |
| View reports | ✓ | ✓ | ✓ (limited) | ✓ (financial reports) |
| Manage admin team (grant/revoke roles) | ✓ | – | – | – |
| View audit logs / security events | ✓ | ✓ (own actions + operational) | – | – (financial-only via finance audit view) |
| Change platform settings | ✓ | – | – | – |

## Design principles

- **Least privilege by default** — a new admin role starts with nothing granted; capabilities are added explicitly.
- **Financial and content-moderation authority are separated** — `FINANCE_ADMIN` cannot moderate content or suspend accounts; `ADMIN` cannot move money or change fee/referral rule configuration. This split limits the blast radius of a single compromised or malicious admin account.
- **`SUPER_ADMIN` is the only role that can grant/revoke other admin roles** — see `admin.domain.in/users/admin-team`.
- **Every capability exercised is audit-logged** regardless of role, including `SUPER_ADMIN` — see [`AUDIT_LOGS.md`](AUDIT_LOGS.md).

## Related documents

[`ADMIN_PANEL.md`](ADMIN_PANEL.md), [`../product/USER_ROLES.md`](../product/USER_ROLES.md), [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md).
