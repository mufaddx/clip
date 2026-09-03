# UI/UX Overview

## Design intent

CLIP must feel premium, modern, trustworthy, and data-driven — closer to a fintech dashboard than a generic SaaS template. Every screen should read as calm and legible even when it's showing dense data (campaign performance, wallet ledgers, admin queues).

## Principles

- **Premium**: generous whitespace, restrained color, real typographic hierarchy — not cramped, not flashy.
- **Modern**: current interaction patterns (skeleton loaders, inline validation, optimistic UI) without chasing trends that hurt clarity.
- **Professional / Trustworthy**: financial numbers are always precise and consistently formatted; status is always communicated with both color and text/icon (never color alone).
- **Data-driven**: charts and tables are first-class citizens, not afterthoughts bolted onto a marketing template.
- **Minimal**: one primary action per screen; secondary actions are visually secondary.
- **Fast**: perceived performance via skeletons and streamed server rendering, not just raw speed.
- **Easy to navigate**: the sidebar + header pattern (see [`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md)) is identical in structure across clipper/brand/admin so switching context doesn't mean re-learning an interface.

## Explicitly avoid

- Overcrowded screens (more than one dense table/chart per view without a scroll or tab boundary).
- Too many colors — status/semantic colors are the only saturated colors; everything else is neutral (see [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md)).
- Decorative gradients unrelated to state or brand.
- Excessive borders/dividers — hierarchy comes from spacing and elevation, not lines around everything.
- A "generic admin template" look — no unstyled default component library aesthetics leaking through.

## How the pieces fit together

- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — the full visual language (color, type, spacing, shadows, etc.)
- [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md) — the same language as literal token values consumed by Tailwind/`@clip/config`
- [`COMPONENT_LIBRARY.md`](COMPONENT_LIBRARY.md) — the concrete component inventory in `@clip/ui`
- [`RESPONSIVE_DESIGN.md`](RESPONSIVE_DESIGN.md) — breakpoint behavior per app
- [`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md) — sidebar/header structure
- [`PAGE_SPECIFICATIONS.md`](PAGE_SPECIFICATIONS.md) — per-page content requirements
- [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md) — the dashboard home layout pattern
- [`EMPTY_STATES.md`](EMPTY_STATES.md), [`LOADING_STATES.md`](LOADING_STATES.md), [`ERROR_STATES.md`](ERROR_STATES.md) — the three states every data view must design for beyond the "happy path"

Every new screen is checked against this document before being considered done.
