"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@clip/ui";
import { brandNav } from "../lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar
      items={brandNav}
      activePath={pathname}
      logo={<img src="/logo-wordmark.png" alt="Vidlix" className="h-5 w-auto" />}
    />
  );
}
