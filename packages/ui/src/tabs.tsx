"use client";

import * as React from "react";
import { cn } from "./cn";

// Underline style for section switches — see docs/ui-ux/DESIGN_SYSTEM.md "Tabs".
export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            value === item.value
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          {item.label}
          {item.count != null ? (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
