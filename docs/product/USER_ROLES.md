# User Roles

## Purpose

Defines every role in the system, what application(s) it can reach, and the permission boundary enforced **server-side** (never trust a frontend redirect alone — see [`architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md)).

## Role list

| Role | Applications | Summary |
|---|---|---|
| `SUPER_ADMIN` | admin.domain.in | Full platform control: users, finance, settings, security, can grant/revoke other admin roles |
| `ADMIN` | admin.domain.in | Operational platform management: campaigns, users, moderation — cannot change platform financial/security settings |
| `SUPPORT` | admin.domain.in | Support tickets, disputes, read-only access to user/campaign data needed to resolve tickets |
| `FINANCE_ADMIN` | admin.domain.in | Wallet, payments, withdrawals, refunds, referral rewards — no access to content moderation or user suspension |
| `BRAND_OWNER` | brand.domain.in, domain.in | Owns a brand account: billing, team management, full campaign control for that brand |
| `BRAND_TEAM_MEMBER` | brand.domain.in, domain.in | Invited into a brand account with a scoped permission set (see below); cannot manage billing or remove the owner |
| `CLIPPER` | clipper.domain.in, domain.in | Creator account: browse/accept campaigns, connect Instagram, submit reels, manage wallet/withdrawals |

A user has exactly one primary role at signup (`BRAND_OWNER` or `CLIPPER`), set during onboarding (see [`users/ONBOARDING_FLOW.md`](../users/ONBOARDING_FLOW.md)). Admin-side roles are never self-service — they are granted by a `SUPER_ADMIN` through `admin.domain.in/users`.

## Brand team member permission scopes

`BRAND_TEAM_MEMBER` rows carry a `permissions` set (stored on `team_members`, see [`database/DATABASE_SCHEMA.md`](../database/DATABASE_SCHEMA.md)) chosen from:

- `campaigns.view`, `campaigns.create`, `campaigns.edit`, `campaigns.approve_budget`
- `analytics.view`, `reports.view`
- `wallet.view` (never `wallet.spend` — only `BRAND_OWNER` can move money)
- `team.invite` (owner-only by default, can be delegated)

A team member with no explicit `campaigns.approve_budget` permission can build a campaign draft but cannot move it past the funding step — the owner (or a delegate) must approve spend.

## Role → default landing route

| Role | Landing route after login |
|---|---|
| `BRAND_OWNER`, `BRAND_TEAM_MEMBER` | `brand.domain.in/dashboard` |
| `CLIPPER` | `clipper.domain.in/dashboard` |
| `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `FINANCE_ADMIN` | `admin.domain.in/dashboard` |

See [`users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md) for the full redirect and cross-domain session mechanics.

## Enforcement

- Every API route declares the roles/permissions allowed to call it (NestJS guard, see [`api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md)).
- Every frontend route group is wrapped by a role check in middleware **and** the API independently re-checks — the frontend check is a UX convenience, never the security boundary.
- Attempting to reach a subdomain your role doesn't own returns a 403 page with a link back to your correct app; it does not silently redirect to login (that would leak whether an email exists).

## Edge cases

- A user cannot hold both `CLIPPER` and `BRAND_OWNER` on the same account. If someone genuinely needs both, they create two separate accounts with different emails — this keeps wallet, tax, and dispute logic unambiguous.
- Deactivated/suspended users keep their row and role (for audit and financial history) but fail authentication with a specific "account suspended" error, distinct from "invalid credentials."
- Removing the last `BRAND_OWNER` from a brand is blocked at the API level — a brand must always have at least one owner.
