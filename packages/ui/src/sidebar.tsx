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
        "flex h-full flex-col border-r border-slate-200 bg-white",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Same height + bottom border as the top Header bar, so the two
          form one continuous line across the full width and the page
          heading (rendered in Header) lines up with the logo. */}
      {logo ? (
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4">{logo}</div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map((item) => (
          <SidebarGroup key={item.href} item={item} activePath={activePath} collapsed={collapsed} />
        ))}
      </div>
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
          "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        {item.icon ? <span className="h-[18px] w-[18px] shrink-0 [&>svg]:h-full [&>svg]:w-full">{item.icon}</span> : null}
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
