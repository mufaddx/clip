# API Authorization

## Purpose

Every API route enforces authentication and role/permission authorization server-side — this is the actual security boundary; frontend route guards (see [`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md)) are UX only.

## Two-layer guard model

1. **`JwtAuthGuard`** — verifies the access token from the session cookie is valid and unexpired; attaches `req.user` (id, role, permissions). Applied globally except routes explicitly marked `@Public()`.
2. **`RolesGuard` / `PermissionsGuard`** — declared per-route via decorators, e.g. `@Roles('BRAND_OWNER', 'BRAND_TEAM_MEMBER')` or `@RequirePermission('campaigns.approve_budget')`. Runs after `JwtAuthGuard` and rejects with 403 if the caller's role/permission set doesn't satisfy the requirement.

## Object-level authorization

Role/permission checks alone don't prove ownership of a specific resource — every service method that reads/writes a specific campaign, wallet, or reel additionally verifies the resource belongs to (or is otherwise visible to) the calling user:

```ts
// conceptual example inside CampaignsService
async getCampaign(userId: string, campaignId: string) {
  const campaign = await this.db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new NotFoundException();
  if (campaign.brandId !== (await this.brandIdForUser(userId)) && !this.isAdmin(userId)) {
    throw new ForbiddenException();
  }
  return campaign;
}
```

A `BRAND_OWNER` role does not, by itself, grant access to *every* campaign — only campaigns belonging to that brand (or, for admin roles, campaigns visible per their admin permission scope).

## Admin role matrix (summary — full detail in [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md))

| Capability | `SUPER_ADMIN` | `ADMIN` | `SUPPORT` | `FINANCE_ADMIN` |
|---|---|---|---|---|
| Approve/reject campaigns | ✓ | ✓ | – | – |
| Suspend users | ✓ | ✓ | – | – |
| View support/dispute data | ✓ | ✓ | ✓ (read + respond) | – |
| Process withdrawals/refunds | ✓ | – | – | ✓ |
| Configure performance/referral rules | ✓ | – | – | – |
| Manage admin team roles | ✓ | – | – | – |

## Brand team permission checks

`@RequirePermission('campaigns.approve_budget')` etc. reads from the caller's `team_members.permissions` set rather than a static role — see [`../users/TEAM_MEMBER_FLOW.md`](../users/TEAM_MEMBER_FLOW.md).

## Failure behavior

- Missing/invalid session → 401 `{ code: "UNAUTHENTICATED" }`.
- Valid session, insufficient role/permission → 403 `{ code: "FORBIDDEN" }`.
- Valid session and role, but object-level ownership fails → 403 `{ code: "FORBIDDEN" }` or 404 (deliberately 404 for some lookups to avoid confirming a resource's existence to an unauthorized caller — decided per-endpoint based on sensitivity).

## Related documents

[`../product/USER_ROLES.md`](../product/USER_ROLES.md), [`../admin/ADMIN_PERMISSIONS.md`](../admin/ADMIN_PERMISSIONS.md), [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md).
