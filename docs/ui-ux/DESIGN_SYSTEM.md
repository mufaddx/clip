# Design System

The canonical visual language for CLIP. `DESIGN_TOKENS.md` mirrors this document as literal token names/values consumed by `packages/config`; this document explains the *why* and the usage rules.

## Color

- **Brand primary — Indigo**: used for primary actions, active nav states, links, focus rings. Base `#4F46E5`, hover `#4338CA`, active `#3730A3`, subtle background tint `#EEF2FF`.
- **Ink (near-black, not pure black)**: `#0F1222` for primary text — pure black reads harsher and lower-quality than a near-black with a hint of the brand hue.
- **Neutrals (slate scale)**: `50` `#F8FAFC` → `900` `#0F172A`, used for backgrounds, borders, secondary text. Backgrounds use `50`/`100`; borders use `200`; secondary text uses `500`; primary text uses `900`/ink.
- **Semantic**
  - Success (qualified performance, completed, available balance): `#16A34A`, tint `#F0FDF4`.
  - Warning (pending, expiring soon, review needed): `#D97706`, tint `#FFFBEB`.
  - Danger (rejected, failed, suspended): `#DC2626`, tint `#FEF2F2`.
  - Info (in progress, informational): `#0284C7`, tint `#F0F9FF`.
- **Rule**: color is never the only signal for status — every colored badge/status pill ships with a label and/or icon (accessibility + colorblind-safety).

## Typography

- Typeface: **Inter** (system-ui fallback stack) for UI text; a monospace face (e.g. `ui-monospace`) for numeric ledger/transaction ids only.
- Scale (rem, 16px base): `xs` 0.75 / `sm` 0.875 / `base` 1 / `lg` 1.125 / `xl` 1.25 / `2xl` 1.5 / `3xl` 1.875 / `4xl` 2.25 / `5xl` 3.
- Weights: 400 body, 500 emphasis/labels, 600 headings/buttons, 700 hero/marketing headlines only.
- Numeric data (currency, metrics) uses tabular figures (`font-variant-numeric: tabular-nums`) so columns of numbers align.

## Spacing

4px base unit: `1`=4px `2`=8px `3`=12px `4`=16px `5`=20px `6`=24px `8`=32px `10`=40px `12`=48px `16`=64px. Component internal padding uses the smaller steps (2–4); layout gaps use the larger steps (6–16).

## Border radius

`sm` 6px (inputs, small controls) · `md` 10px (buttons, badges) · `lg` 14px (cards) · `xl` 20px (modals, large panels) · `full` (avatars, pill badges).

## Shadows (elevation)

`xs` — hairline card resting state · `sm` — hover/raised card · `md` — dropdowns/popovers · `lg` — modals/dialogs. Shadows are subtle (low opacity, soft blur) — CLIP does not use hard drop-shadows.

## Icons

Single icon set throughout (Lucide) at consistent stroke width (1.75px) — never mixing icon families within one app.

## Component visual rules

- **Buttons**: primary (filled indigo), secondary (neutral outline), ghost (no border, hover background), destructive (red, only for irreversible actions), all with a disabled and loading (spinner replaces label) state.
- **Inputs**: label above field, helper text below, error state replaces helper text with danger-colored message + red border, focus state uses a 2px indigo ring.
- **Tables**: sticky header on scroll, row hover background, right-aligned numeric columns, zebra striping avoided (relies on hover + dividers instead).
- **Cards**: `lg` radius, `xs` shadow at rest, 24px internal padding, a card never nests another card.
- **Charts**: see `dataviz` conventions — categorical colors drawn from the semantic/brand palette only, never arbitrary hues; every chart has an accessible legend and axis labels.
- **Badges**: pill-shaped, tinted background + full-saturation text of the matching semantic color (e.g. success tint background, success-700 text) for sufficient contrast.
- **Status colors**: `DRAFT`/neutral, `PENDING`/warning, `ACTIVE`/`LIVE`/success, `PAUSED`/warning, `COMPLETED`/info, `REJECTED`/`FAILED`/`SUSPENDED`/danger.
- **Modals**: centered, `xl` radius, backdrop blur + dim, focus-trapped, closable via Esc/backdrop click unless the action is destructive-confirm (then explicit button only).
- **Dropdowns/menus**: `md` shadow, 6px offset from trigger, keyboard-navigable.
- **Tabs**: underline style for section switches within a page; pill style for filter-like toggles.
- **Tooltips**: dark background regardless of theme, appears after a short hover delay, never contains interactive content (use a popover for that).

## Related documents

[`DESIGN_TOKENS.md`](DESIGN_TOKENS.md), [`COMPONENT_LIBRARY.md`](COMPONENT_LIBRARY.md), [`EMPTY_STATES.md`](EMPTY_STATES.md), [`LOADING_STATES.md`](LOADING_STATES.md), [`ERROR_STATES.md`](ERROR_STATES.md).
