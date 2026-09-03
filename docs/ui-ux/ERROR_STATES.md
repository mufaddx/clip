# Error States

## Principle

Errors are specific and actionable wherever the API provides a typed error code (see [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md)); a generic "Something went wrong" is the fallback, never the default design.

## Categories

| Category | Presentation |
|---|---|
| Field-level validation error | Inline under the specific input, red text + red border, no toast |
| Form-level / action error (e.g. `CAMPAIGN_NOT_FUNDED`) | Inline banner at the top of the form/section with the specific message, plus a toast if the action was triggered from outside the visible form |
| Page-level data fetch failure | Full-section error card (icon + message + "Retry" button) in place of the section that failed — sibling sections still render if they succeeded |
| Permission denied (403) | Dedicated page: explains the restriction, links to the correct app/role's URL where applicable — never a bare 403 with no context |
| Not found (404) | Dedicated page with a link back to the relevant list (e.g. "Campaign not found" → link to Campaigns) |
| Network/offline | Toast: "You're offline — changes will retry when you're back online" for mutation attempts; a read failure shows the page-level retry card |
| Unexpected/unhandled (500) | Full-page fallback with a "Report this" support link, logged client-side with enough context to reproduce |

## Rules

- Every error surfaced to the user is paired with the next action they can take (retry, go back, contact support, fix the field) — never a dead end.
- Financial action errors (withdrawal, fund campaign, refund) always show the specific reason (e.g. "Insufficient available balance") — never a generic failure for money-moving actions, since users need to know whether the action actually happened.
- Toast errors auto-dismiss after a delay but remain manually dismissible; banner/inline errors persist until the underlying issue is resolved or the user navigates away.
- Errors are never silently swallowed — if an API call fails and no UI reflects it, that's a bug, not an acceptable edge case.

## Related documents

[`EMPTY_STATES.md`](EMPTY_STATES.md), [`LOADING_STATES.md`](LOADING_STATES.md), [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md).
