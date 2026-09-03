# Dashboard Layouts

## Shared structure

Every `/dashboard` home (clipper, brand, admin) follows the same layout pattern via `@clip/ui`'s `AppShell` + `PageHeader` + `StatCard` row + section grid, so the three apps feel like one product even though the data differs entirely.

```
┌ AppShell ──────────────────────────────────────────────┐
│ PageHeader: "Dashboard" + date-range control            │
│ ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐      │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│ ┌ Primary chart (2/3 width) ┐ ┌ Side panel (1/3 width) ┐ │
│ │                            │ │                        │ │
│ └────────────────────────────┘ └────────────────────────┘ │
│ ┌ Secondary sections (full width, stacked) ───────────┐  │
└──────────────────────────────────────────────────────────┘
```

## Clipper dashboard home

- **Stat row**: Available Earnings, Pending Earnings, Total Earnings, Qualified Performance, Active Campaigns, Completed Campaigns.
- **Primary chart**: Performance Trend (qualified performance over time).
- **Side panel**: Account Health (Instagram connection status, trust score).
- **Sections**: Recent Campaign Activity, Recommended Campaigns (card grid, see [`../campaigns/CREATOR_MATCHING.md`](../campaigns/CREATOR_MATCHING.md)), Recent Earnings, Upcoming Deadlines, Notifications.

## Brand dashboard home

- **Stat row**: Active Campaigns, Total Campaigns, Campaign Performance, Qualified Performance, Budget Used, Wallet Balance.
- **Primary chart**: Campaign Performance Chart (aggregate qualified performance across active campaigns over time).
- **Side panel**: Budget Usage (locked vs. spent vs. available).
- **Sections**: Active Campaigns list, Creator Activity, Recent Activity, Performance Breakdown (by campaign or by creator category).

## Admin dashboard home

- **Stat row**: Total Users, Total Brands, Total Clippers, Active Campaigns, Total Campaign Budget, Platform Revenue, Total Qualified Performance, Pending Withdrawals.
- **Primary chart**: User Growth Chart and Campaign Performance Chart (tabbed within the same chart card).
- **Side panel**: System Health (queue depth, Instagram connection error rate, job failure rate).
- **Sections**: Revenue Overview, Recent Activity, Pending Actions (approval queues), Risk Alerts (flagged campaigns/accounts).

## Data loading pattern

The stat row and shell render immediately from server-rendered skeleton values; each stat and chart streams in independently (React Suspense boundaries per section) rather than blocking the whole page on the slowest aggregate query — see [`LOADING_STATES.md`](LOADING_STATES.md).

## Related documents

[`../product/PLATFORM_FEATURES.md`](../product/PLATFORM_FEATURES.md), [`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md), [`COMPONENT_LIBRARY.md`](COMPONENT_LIBRARY.md).
