# Design Tokens

Literal token values as implemented in `packages/config` (Tailwind theme extension + CSS variables). These are what code actually imports — keep this file and `packages/config/src/tailwind-preset.ts` in sync whenever either changes.

## Color tokens

```ts
colors: {
  brand: {
    50: "#EEF2FF", 100: "#E0E7FF", 500: "#6366F1",
    600: "#4F46E5", 700: "#4338CA", 800: "#3730A3",
  },
  ink: "#0F1222",
  slate: { 50:"#F8FAFC",100:"#F1F5F9",200:"#E2E8F0",300:"#CBD5E1",
           400:"#94A3B8",500:"#64748B",600:"#475569",700:"#334155",
           800:"#1E293B",900:"#0F172A" },
  success: { 50:"#F0FDF4", 600:"#16A34A", 700:"#15803D" },
  warning: { 50:"#FFFBEB", 600:"#D97706", 700:"#B45309" },
  danger:  { 50:"#FEF2F2", 600:"#DC2626", 700:"#B91C1C" },
  info:    { 50:"#F0F9FF", 600:"#0284C7", 700:"#0369A1" },
}
```

## Typography tokens

```ts
fontFamily: {
  sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  mono: ["ui-monospace", "SFMono-Regular", "monospace"],
},
fontSize: {
  xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem",
  xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem",
  "4xl": "2.25rem", "5xl": "3rem",
},
fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
```

## Spacing tokens

```ts
spacing: { 1:"4px", 2:"8px", 3:"12px", 4:"16px", 5:"20px",
           6:"24px", 8:"32px", 10:"40px", 12:"48px", 16:"64px" }
```

## Radius tokens

```ts
borderRadius: { sm:"6px", md:"10px", lg:"14px", xl:"20px", full:"9999px" }
```

## Shadow tokens

```ts
boxShadow: {
  xs: "0 1px 2px 0 rgb(15 18 34 / 0.04)",
  sm: "0 2px 6px -1px rgb(15 18 34 / 0.08)",
  md: "0 8px 16px -4px rgb(15 18 34 / 0.10)",
  lg: "0 16px 32px -8px rgb(15 18 34 / 0.16)",
}
```

## Status → token mapping

| Status | Token |
|---|---|
| `DRAFT`, neutral/unknown | `slate.500` text on `slate.100` bg |
| `PENDING`, `PENDING_REVIEW`, `EXPIRING_SOON` | `warning.700` text on `warning.50` bg |
| `ACTIVE`, `LIVE`, `APPROVED`, `AVAILABLE`, `COMPLETED_SUCCESS` | `success.700` text on `success.50` bg |
| `PAUSED` | `warning.700` text on `warning.50` bg |
| `COMPLETED`, `PROCESSING`, `IN_PROGRESS` | `info.700` text on `info.50` bg |
| `REJECTED`, `FAILED`, `SUSPENDED`, `EXPIRED`, `CANCELLED` | `danger.700` text on `danger.50` bg |

## Usage rule

Components consume tokens via Tailwind utility classes generated from this theme (e.g. `bg-brand-600`, `text-slate-500`) — never raw hex values inline in component code. A new color need is added here first, then used.

## Related documents

[`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md), [`COMPONENT_LIBRARY.md`](COMPONENT_LIBRARY.md).
