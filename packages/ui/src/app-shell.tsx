"use client";

import * as React from "react";
import { PageHeaderProvider, usePageHeaderContext } from "./page-header-context";

// The sidebar + header + content-area frame shared by clipper/brand/admin —
// see docs/ui-ux/DASHBOARD_LAYOUTS.md.
export interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <PageHeaderProvider>
      <div className="flex h-screen bg-slate-50">
        {sidebar}
        <div className="flex flex-1 flex-col overflow-hidden">
          {header}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </PageHeaderProvider>
  );
}

// Every dashboard page calls this at the top of its render with its name —
// it no longer renders a heading inline. Instead it hands the title/
// description/action up to the fixed <Header /> bar (same row as the
// sidebar logo), so every page shows its name in the same place, and the
// scrollable content starts clean below that line.
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { setState } = usePageHeaderContext();
  React.useEffect(() => {
    setState({ title, description, action });
  }, [title, description, action, setState]);
  return null;
}
