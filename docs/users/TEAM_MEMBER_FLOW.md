# Team Member Flow

## Scope

How a `BRAND_TEAM_MEMBER` is invited into a brand account and operates within a scoped permission set. See [`../product/USER_ROLES.md`](../product/USER_ROLES.md) for the permission list this flow assigns.

## Invitation

```
Brand Owner (or a delegate with team.invite) → brand.domain.in/team → "Invite Member"
  → enters email + selects permission scopes (campaigns.view/create/edit/approve_budget,
     analytics.view, reports.view, wallet.view, team.invite)
  → invite email sent with a signed, time-limited accept link
  → invitee clicks link → if no account exists, brief signup (name + password) tied to that
     invite's email; if an account already exists under that email, they simply confirm
  → invitee logs in → lands on brand.domain.in/dashboard scoped to the inviting brand
```

## Scoped access in practice

- A team member without `campaigns.approve_budget` can complete every step of the campaign creation wizard except the final funding action — the "Submit for Review" step still works, but moving an approved campaign to funded/live requires the owner or a delegate with that permission.
- A team member without `wallet.spend` (never grantable — owner-only) can view `/wallet` if `wallet.view` is granted, but the "Add Funds" action is hidden and blocked server-side if attempted directly.
- `/team` itself is only visible to members with `team.invite`; others don't see the nav item at all (see [`../ui-ux/NAVIGATION_ARCHITECTURE.md`](../ui-ux/NAVIGATION_ARCHITECTURE.md)).

## Removal

Removing a team member immediately revokes their session (refresh token invalidated) and hides the brand's data on next request — not just on next login. A brand must always retain at least one `BRAND_OWNER`; the API blocks removing/demoting the last owner.

## Edge cases

- An invite sent to an email that never accepts simply expires (default 7 days, configurable) and can be resent.
- A team member's permissions can be edited after acceptance at any time from `/team`; changes take effect on their next request (permissions are checked live, not cached in their session token beyond the short access-token TTL).

## Related documents

[`BRAND_USER_FLOW.md`](BRAND_USER_FLOW.md), [`../product/USER_ROLES.md`](../product/USER_ROLES.md), [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md).
