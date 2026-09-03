"use client";

import * as React from "react";
import { cn } from "./cn";
import type { NavItem } from "./nav";

export interface SidebarProps {
  items: NavItem[];
  activePath: string;
  logo?: React.ReactNode;
  /** True on mobile drawer / tablet rail — see docs/ui-ux/RESPONSIVE_DESIGN.md. */
  collapsed?: boolean;
}

function isActive(item: NavItem, activePath: string): boolean {
  return activePath === item.href || activePath.startsWith(item.href + "/");
}

export function Sidebar({ items, activePath, logo, collapsed }: SidebarProps) {
  return (
    <nav
      className={cn(
        "flex h-full flex-col gap-1 border-r border-slate-200 bg-white p-3",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {logo ? <div className="mb-4 px-2">{logo}</div> : null}
      {items.map((item) => (
        <SidebarGroup key={item.href} item={item} activePath={activePath} collapsed={collapsed} />
      ))}
    </nav>
  );
}

function SidebarGroup({
  item,
  activePath,
  collapsed,
}: {
  item: NavItem;
  activePath: string;
  collapsed?: boolean;
}) {
  const active = isActive(item, activePath);
  const [open, setOpen] = React.useState(active);

  return (
    <div>
      <a
        href={item.children ? undefined : item.href}
        onClick={item.children ? () => setOpen((o) => !o) : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        {!collapsed && <span className="truncate">{item.label}</span>}
      </a>
      {item.children && open && !collapsed ? (
        <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <a
              key={child.href}
              href={child.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive(child, activePath)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {child.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
