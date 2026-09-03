import * as React from "react";
import { cn } from "./cn";

// See docs/ui-ux/EMPTY_STATES.md — every empty state is designed, not a bare "no data".
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-16 text-center", className)}>
      {icon ? <div className="mb-2 text-slate-400">{icon}</div> : null}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description ? <p className="max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
