# Loading States

## Principle

Loading is communicated with skeletons shaped like the content that's coming, not a generic spinner — a spinner is only acceptable for short, indeterminate actions inside a button or small control.

## Skeleton conventions

- **Stat cards**: skeleton shows the card frame with a shimmering bar where the number/label will be — never a blank card.
- **Tables**: skeleton rows (5–8) matching the real column layout, so the table doesn't visibly reflow when data arrives.
- **Charts**: a skeleton chart-shaped block (axes outline, no data) rather than a spinner in an empty box.
- **Cards/detail pages**: skeleton blocks matching the real heading/paragraph/image proportions.

## Where loading happens

- **Server-rendered shell first**: the `AppShell`, sidebar, header, and page title render immediately (no loading state needed for navigation chrome).
- **Per-section streaming**: each dashboard section (stat row, primary chart, side panel, secondary sections) is its own Suspense boundary so a slow query in one section never blocks the others from appearing — see [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md).
- **Client-side mutations**: buttons show a `loading` state (spinner replaces label, button disabled) during submission; the surrounding page is not grayed out unless the action is a full-page transition (e.g., completing onboarding).
- **Polling data** (wallet balance, notification count): updates in place without a loading flash once initial data has loaded — only the first load shows a skeleton.

## Timing rules

- A skeleton is shown immediately (no artificial delay) but if data resolves in under ~150ms, no skeleton flash should be visible — resolved via suspense/transition timing, not a hardcoded setTimeout.
- Any load expected to take more than ~3 seconds (large exports, bulk admin operations) shows a progress indicator with a percentage or step count instead of an indefinite skeleton.

## Related documents

[`EMPTY_STATES.md`](EMPTY_STATES.md), [`ERROR_STATES.md`](ERROR_STATES.md), [`../architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md).
