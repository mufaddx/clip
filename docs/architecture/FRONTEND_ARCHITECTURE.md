# Frontend Architecture

## Purpose

Describes how the four Next.js applications are built, how they share the design system, and the data-fetching conventions that keep business logic out of components.

## Stack

- Next.js (App Router), TypeScript, React Server Components by default.
- Tailwind CSS driven by shared design tokens from `@clip/config` (see [`../ui-ux/DESIGN_TOKENS.md`](../ui-ux/DESIGN_TOKENS.md)).
- `@clip/ui` for every shared primitive (button, input, table, card, modal, tabs, badge, chart wrapper) — see [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md).
- `@tanstack/react-query` for client-side data fetching/caching where a Client Component needs live interactivity (e.g., wallet balance polling, notification bell).

## Directory convention (per app)

```
src/
  app/
    (public)/...            unauthenticated routes (only in public-web)
    (auth)/login, /signup   auth routes
    (dashboard)/...         role-specific authenticated routes, layout has sidebar+header
    layout.tsx
    middleware.ts           session check + role redirect
  components/                app-specific components (not shared across apps)
  lib/
    api-client.ts           typed fetch wrapper over @clip/types DTOs
    auth.ts                 session read helpers (server-side)
  styles/globals.css
```

## Data fetching rules

1. Server Components fetch through `lib/api-client.ts`, forwarding the incoming request's auth cookie to `api.domain.in` — never fetch Postgres/`@clip/db` directly from a Next.js app.
2. Client Components that need live/interactive data use React Query hooks that wrap the same API client.
3. Mutations always go through the API — optimistic UI updates are allowed, but the source of truth is the API's response, and any optimistic state is reconciled against it.

## State management

- Server state (campaigns, wallet, users) lives in React Query's cache, not global client state.
- Local UI state (open modal, active tab, wizard step) uses component state or a small Zustand store per app when state must survive across route segments (e.g., the multi-step campaign creation wizard).

## Rendering strategy

- Marketing pages (`public-web`): static generation where possible, ISR for anything that changes occasionally (pricing, FAQ).
- Dashboards: server-rendered shell with skeleton loading states (see [`../ui-ux/LOADING_STATES.md`](../ui-ux/LOADING_STATES.md)) streamed in, heavy aggregate data (charts) fetched client-side after the shell paints.

## Shared design system consumption

Every app imports from `@clip/ui` and Tailwind config from `@clip/config` rather than redefining tokens locally — a token change (e.g., a color) is a single-package change that propagates to all four apps on next build. See [`../ui-ux/DESIGN_SYSTEM.md`](../ui-ux/DESIGN_SYSTEM.md).

## Related documents

[`../ui-ux/UI_UX_OVERVIEW.md`](../ui-ux/UI_UX_OVERVIEW.md), [`APPLICATION_ARCHITECTURE.md`](APPLICATION_ARCHITECTURE.md), [`../development/FOLDER_STRUCTURE.md`](../development/FOLDER_STRUCTURE.md).
