# Component Library (`@clip/ui`)

## Purpose

Inventory of shared components every app imports instead of re-implementing. If a component you need isn't listed here, add it to `packages/ui` and this document together — never build a one-off duplicate inside an app.

## Primitives

| Component | Notes |
|---|---|
| `Button` | variants: `primary`, `secondary`, `ghost`, `destructive`; sizes `sm`/`md`/`lg`; `loading` prop swaps label for spinner |
| `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch` | label + helper/error text built in, forward refs for form libraries |
| `Badge` | `variant` maps to the status tokens in [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md) |
| `Avatar` | image with initials fallback |
| `Tooltip`, `Popover`, `DropdownMenu` | built on Radix primitives, styled to tokens |
| `Modal` / `Dialog` | includes a `ConfirmDialog` variant for destructive actions |
| `Tabs` | `underline` and `pill` visual variants |
| `Card` | header/body/footer slots |
| `Table` | sticky header, sortable column headers, built-in empty/loading row states |
| `Skeleton` | base shimmer block used to compose per-page loading states |
| `EmptyState` | icon + title + description + optional CTA slot |
| `Pagination` | page-number + prev/next, used by every paginated list |
| `Toast` | success/warning/danger/info variants, used for async action feedback |

## Layout components

| Component | Notes |
|---|---|
| `AppShell` | the sidebar + header + content-area frame shared by clipper/brand/admin |
| `Sidebar` | takes a nav-item tree (permission-filtered) — see [`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md) |
| `Header` | search, notification bell, help, user menu slots |
| `PageHeader` | title + description + primary action, used at the top of every dashboard page |
| `StatCard` | the top-row metric tiles used on every dashboard home (see [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md)) |

## Data visualization

| Component | Notes |
|---|---|
| `LineChart`, `BarChart`, `DonutChart`, `Sparkline` | thin wrappers standardizing color/legend/tooltip/axis behavior per the `dataviz` conventions |
| `TrendBadge` | small up/down indicator with percentage, colored by success/danger |

## Domain-flavored (still shared, used by 2+ apps)

| Component | Notes |
|---|---|
| `CampaignStatusBadge` | maps campaign lifecycle states to `Badge` variants |
| `WalletBalanceCard` | shared shape used by both clipper wallet and brand wallet, parameterized by balance buckets |
| `StepWizard` | the multi-step form shell used by campaign creation and onboarding |
| `NotificationBell` | dropdown of recent notifications + unread count, used in every `Header` |

## Component authoring rules

- Every component accepts `className` for layout-only overrides but never exposes raw style props that could bypass tokens.
- Every interactive component is keyboard-operable and has visible focus states (WCAG 2.1 AA).
- Every component that renders a list/table designs for its empty and loading state at authoring time, not bolted on later — see [`EMPTY_STATES.md`](EMPTY_STATES.md) and [`LOADING_STATES.md`](LOADING_STATES.md).

## Related documents

[`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md), [`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md), [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md).
