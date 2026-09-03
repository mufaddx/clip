# Responsive Design

## Principle

Every application works on desktop, tablet, and mobile — mobile is a deliberately designed layout, not a shrunk desktop dashboard. See [`../architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md) for the underlying Next.js/Tailwind setup.

## Breakpoints

| Name | Width | Primary target |
|---|---|---|
| `sm` | ≥640px | Large phones (landscape-ish) |
| `md` | ≥768px | Tablets |
| `lg` | ≥1024px | Small laptops |
| `xl` | ≥1280px | Desktops |
| `2xl` | ≥1536px | Large desktops |

## Dashboard apps (clipper/brand/admin)

- **Desktop (`lg`+)**: fixed sidebar (240px) + top header + main content area, as described in [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md).
- **Tablet (`md`–`lg`)**: sidebar collapses to icon-only rail (64px) by default, expandable on tap/hover; header remains full-width.
- **Mobile (`<md`)**: sidebar becomes a drawer triggered by a hamburger button in the header; the header itself compresses to logo + drawer trigger + notification bell + user avatar (search moves into the drawer or a dedicated search screen).
- **Tables on mobile**: dense tables (e.g. transaction history) collapse to a stacked card-per-row layout below `md` rather than horizontally scrolling a shrunk table — horizontal scroll is reserved for content that is inherently tabular and wide (e.g. an admin data-export preview), and always scrolls inside its own container, never the page body.
- **Multi-step wizards** (campaign creation, onboarding): step indicator becomes a compact progress bar + "Step X of Y" label on mobile instead of a full horizontal stepper.
- **Charts**: legends stack below the chart instead of beside it below `md`; axis label density reduces (fewer ticks) to stay legible at narrow widths.

## Public website

Fully responsive marketing layout: multi-column sections collapse to single-column below `md`, the hero CTA pair stacks vertically on mobile, and the nav collapses to a hamburger menu below `md`.

## Touch targets

All interactive elements maintain a minimum 44×44px touch target on mobile regardless of their visual size, via padding rather than shrinking the visible control.

## Testing requirement

Every new page is checked at `375px` (mobile baseline), `768px` (tablet), and `1440px` (desktop) before being considered complete.

## Related documents

[`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md), [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md), [`PAGE_SPECIFICATIONS.md`](PAGE_SPECIFICATIONS.md).
