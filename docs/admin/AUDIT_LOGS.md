# Audit Logs

## Purpose

Every state-changing action taken from `admin.domain.in` is recorded, without exception — including actions by `SUPER_ADMIN`. This is what makes the platform's admin authority reviewable after the fact, and what a dispute or security investigation relies on.

## Entry shape

```
audit_logs
  id, actor_id (the admin user), actor_role,
  action (e.g. "campaign.approve", "user.suspend", "withdrawal.process", "performance_rules.update"),
  target_type, target_id,
  before, after (JSON diffs of the changed state — not the entire row, just what changed),
  ip_address, user_agent, created_at
```

## What triggers a log entry

Every mutating admin endpoint (see [`../api/API_ENDPOINTS.md`](../api/API_ENDPOINTS.md) `/v1/admin/*` and admin-privileged actions on other resource endpoints) writes exactly one `audit_logs` row as part of the same transaction as the mutation itself — if the mutation succeeds, the audit entry exists; there is no code path where one happens without the other.

## Immutability

`audit_logs` is append-only — no update or delete path exists in the application layer for these rows, matching the same principle as [`../finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md)'s `wallet_ledger`.

## Access

`admin.domain.in/security/audit-logs` — visible to `SUPER_ADMIN` fully; `ADMIN` sees operational actions (campaign/user/moderation) but not financial-admin-only actions; `FINANCE_ADMIN` sees financial actions via a scoped audit view. See [`ADMIN_PERMISSIONS.md`](ADMIN_PERMISSIONS.md) for the exact matrix.

## Retention

Indefinite — see [`../database/DATA_RETENTION.md`](../database/DATA_RETENTION.md). Audit logs are never eligible for purging.

## Use in disputes and investigations

A dispute resolution or security investigation reconstructs "what happened and who did it" primarily from `audit_logs` cross-referenced with `wallet_ledger` and `performance_calculations` — see [`../operations/DISPUTE_SYSTEM.md`](../operations/DISPUTE_SYSTEM.md).

## Related documents

[`ADMIN_PANEL.md`](ADMIN_PANEL.md), [`ADMIN_PERMISSIONS.md`](ADMIN_PERMISSIONS.md), [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md).
