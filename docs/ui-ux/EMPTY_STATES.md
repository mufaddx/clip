# Empty States

## Principle

An empty state is a design decision, not a missing feature — it should tell the user what will appear here and give them the action that fills it, via the shared `EmptyState` component (icon + title + description + optional CTA).

## Standard patterns by context

| Context | Title | Description | CTA |
|---|---|---|---|
| Clipper: no campaigns in a filter tab | "No {tab} campaigns yet" | Tab-specific guidance (e.g. Recommended: "We'll show campaigns here once your profile and categories are set") | Link to Available campaigns / Profile settings |
| Clipper: no connected Instagram account | "Connect your Instagram account" | Explains why it's required before accepting campaigns | "Connect Instagram" primary button |
| Brand: no campaigns | "Create your first campaign" | One-line value reminder | "Create Campaign" primary button |
| Brand: empty wallet | "Add funds to launch campaigns" | Explains funding gates campaign launch | "Add Funds" primary button |
| Admin: empty approval queue | "Nothing waiting for review" | Reassuring, not alarming — this is a good state | none |
| Any table/list with an active filter returning nothing | "No results match your filters" | — | "Clear filters" |
| Notifications: none yet | "You're all caught up" | — | none |
| Search with no results | "No results for “{query}”" | Suggest checking spelling / broadening | none |

## Rules

- Never show a bare "No data" with no icon/description — every empty state is designed, not default.
- Distinguish **"nothing exists yet"** (onboarding-flavored, encouraging) from **"a filter/search returned nothing"** (neutral, offers to clear the filter) — they use different copy tone.
- An empty state's CTA, when present, must be the single most useful next action, not a generic "Learn more" link.
- Empty states never block layout — the surrounding page chrome (header, filters, tabs) stays visible and usable so the user can change filters without losing context.

## Related documents

[`LOADING_STATES.md`](LOADING_STATES.md), [`ERROR_STATES.md`](ERROR_STATES.md), [`COMPONENT_LIBRARY.md`](COMPONENT_LIBRARY.md).
