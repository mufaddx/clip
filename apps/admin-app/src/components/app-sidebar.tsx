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
      logo={<span className="font-bold text-brand-600">CLIP Admin</span>}
    />
  );
}
