import * as React from "react";
import { Card } from "./card";
import { cn } from "./cn";

// The top-row metric tile used on every dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md.
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  trend?: { direction: "up" | "down"; label: string };
  loading?: boolean;
}

export function StatCard({ label, value, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-7 w-16 animate-pulse rounded bg-slate-100" />
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {trend ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend.direction === "up" ? "text-success-700" : "text-danger-700"
          )}
        >
          {trend.direction === "up" ? "▲" : "▼"} {trend.label}
        </p>
      ) : null}
    </Card>
  );
}
