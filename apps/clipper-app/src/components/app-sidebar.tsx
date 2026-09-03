"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@clip/ui";
import { clipperNav } from "../lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar
      items={clipperNav}
      activePath={pathname}
      logo={<span className="font-bold text-brand-600">CLIP</span>}
    />
  );
}
