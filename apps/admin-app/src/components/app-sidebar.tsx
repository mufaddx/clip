"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@clip/ui";
import { adminNav } from "../lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar
      items={adminNav}
      activePath={pathname}
      logo={
        <div className="flex items-center gap-2">
          <img src="/logo-wordmark.png" alt="Vidlix" className="h-5 w-auto" />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">ADMIN</span>
        </div>
      }
    />
  );
}
