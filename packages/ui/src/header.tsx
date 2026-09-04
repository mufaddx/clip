"use client";

import * as React from "react";
import { usePageHeaderContext } from "./page-header-context";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Header requirements". The
// current page's title/description/action arrive via context (set by
// <PageHeader> — see app-shell.tsx) so the page name always sits in this
// fixed top bar, on the same row/height as the sidebar logo, instead of
// floating inside the scrollable content below.
export interface HeaderProps {
  menuToggle?: React.ReactNode;
  search?: React.ReactNode;
  notifications?: React.ReactNode;
  userMenu?: React.ReactNode;
}

export function Header({ menuToggle, search, notifications, userMenu }: HeaderProps) {
  const { state } = usePageHeaderContext();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <div className="flex min-w-0 items-center gap-3">
        {menuToggle}
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-lg font-semibold text-ink">{state?.title ?? ""}</h1>
          {state?.description ? (
            <p className="truncate text-xs text-slate-500">{state.description}</p>
          ) : null}
        </div>
      </div>
      {search ? <div className="flex-1 px-4">{search}</div> : null}
      <div className="flex shrink-0 items-center gap-3">
        {state?.action}
        {notifications}
        {userMenu}
      </div>
    </header>
  );
}
