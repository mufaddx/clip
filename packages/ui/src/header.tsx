import * as React from "react";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Header requirements".
export interface HeaderProps {
  menuToggle?: React.ReactNode;
  search?: React.ReactNode;
  notifications?: React.ReactNode;
  userMenu?: React.ReactNode;
}

export function Header({ menuToggle, search, notifications, userMenu }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">{menuToggle}</div>
      <div className="flex-1 px-4">{search}</div>
      <div className="flex items-center gap-3">
        {notifications}
        {userMenu}
      </div>
    </header>
  );
}
