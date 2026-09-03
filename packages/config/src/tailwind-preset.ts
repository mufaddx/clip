/**
 * Shared Tailwind theme — the literal implementation of
 * docs/ui-ux/DESIGN_TOKENS.md. Every app's tailwind.config.js extends this
 * preset rather than redefining tokens locally, so a token change here
 * propagates to all four apps on next build.
 */
import type { Config } from "tailwindcss";

const preset: Pick<Config, "theme"> = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
        },
        ink: "#0F1222",
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        success: { 50: "#F0FDF4", 600: "#16A34A", 700: "#15803D" },
        warning: { 50: "#FFFBEB", 600: "#D97706", 700: "#B45309" },
        danger: { 50: "#FEF2F2", 600: "#DC2626", 700: "#B91C1C" },
        info: { 50: "#F0F9FF", 600: "#0284C7", 700: "#0369A1" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 18 34 / 0.04)",
        sm: "0 2px 6px -1px rgb(15 18 34 / 0.08)",
        md: "0 8px 16px -4px rgb(15 18 34 / 0.10)",
        lg: "0 16px 32px -8px rgb(15 18 34 / 0.16)",
      },
    },
  },
};

export default preset;
