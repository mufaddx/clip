import type { ReactNode } from "react";

/**
 * Nav tree shape shared by Sidebar across clipper/brand/admin apps.
 * See docs/ui-ux/NAVIGATION_ARCHITECTURE.md. Each app builds its own tree and
 * filters it server-side by the session's role/permissions before it ever
 * reaches the client — a permission-less item is never rendered-but-hidden.
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
}
