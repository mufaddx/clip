import type { ReactNode } from "react";

/** Shared dark "glass" panel + input styling for every (auth) page — keeps
 * login/signup/forgot-password/reset-password visually identical instead
 * of each page hand-rolling its own card. */
export function AuthCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`w-full rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export const authInputClass =
  "h-11 rounded-md border border-white/10 bg-white/5 px-3 text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40";

export const authLabelClass = "font-medium text-slate-300";
