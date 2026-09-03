# Support System

## Purpose

A ticket-based support channel for brands and clippers, distinct from [`DISPUTE_SYSTEM.md`](DISPUTE_SYSTEM.md) (which contests a specific outcome) — support handles questions, issues, and requests that don't necessarily involve contesting a payout or decision.

## Categories

`Campaign`, `Payment`, `Instagram`, `Verification`, `Performance`, `Account`, `Other` — selected by the user when opening a ticket (`clipper.domain.in/support` or `brand.domain.in/support`), used for routing and reporting.

## Lifecycle

```
Open → In Progress → Waiting for User → Resolved → Closed
```

- **Open** — newly created, unassigned.
- **In Progress** — an admin/support agent has picked it up.
- **Waiting for User** — support has responded and is waiting on the user; the clock for "needs attention" pauses here from the support team's side.
- **Resolved** — support considers it addressed; the user can reopen (moves back to `In Progress`) within a grace period.
- **Closed** — terminal, either resolved-and-timed-out or explicitly closed by the user/admin.

## Data model

```
support_tickets: id, user_id, category, subject, status, priority, assigned_to (admin), created_at, updated_at
ticket_messages: id, ticket_id, author_id, author_type (user | admin), body, attachments, created_at
```

## Access

- A user sees and can message only their own tickets.
- `SUPPORT`, `ADMIN`, `SUPER_ADMIN` see the full queue at `admin.domain.in/support`, filterable by category/status/priority; `FINANCE_ADMIN` does not have ticket access (payment-category tickets needing financial action are escalated/handed off, not directly worked by finance admins in the ticket UI — see [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md)).

## Escalation to disputes

A support agent who determines a ticket is actually contesting a specific payout/verification/performance outcome converts it into a formal dispute (see [`DISPUTE_SYSTEM.md`](DISPUTE_SYSTEM.md)) rather than resolving it as a support ticket — this keeps outcome-contesting cases in the auditable dispute flow with its evidence and resolution requirements.

## Notifications

Every status change and new message triggers a notification to the ticket's owner per [`NOTIFICATION_SYSTEM.md`](NOTIFICATION_SYSTEM.md).

## Related documents

[`DISPUTE_SYSTEM.md`](DISPUTE_SYSTEM.md), [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md), [`../users/CLIPPER_USER_FLOW.md`](../users/CLIPPER_USER_FLOW.md).
