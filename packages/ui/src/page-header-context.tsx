"use client";

import * as React from "react";

// Lets the page-specific <PageHeader> (rendered deep inside the scrollable
// <main>) hand its title/description/action up to the fixed top <Header />
// bar instead of rendering its own heading inline — see
// docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Header requirements". This is what
// keeps the page name aligned with the sidebar logo row on every page,
// instead of floating further down inside the content.
export interface PageHeaderState {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

interface PageHeaderContextValue {
  state: PageHeaderState | null;
  setState: (state: PageHeaderState) => void;
}

const PageHeaderContext = React.createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PageHeaderState | null>(null);
  const value = React.useMemo(() => ({ state, setState }), [state]);
  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeaderContext() {
  const ctx = React.useContext(PageHeaderContext);
  if (!ctx) {
    throw new Error("usePageHeaderContext must be used within <AppShell>");
  }
  return ctx;
}
