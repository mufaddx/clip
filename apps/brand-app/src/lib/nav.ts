import type { NavItem } from "@clip/ui";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Brand (brand.domain.in)".
export const brandNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Campaigns",
    href: "/campaigns",
    children: [
      { label: "All Campaigns", href: "/campaigns/all" },
      { label: "Create Campaign", href: "/campaigns/create" },
      { label: "Drafts", href: "/campaigns/drafts" },
      { label: "Pending", href: "/campaigns/pending" },
      { label: "Active", href: "/campaigns/active" },
      { label: "Paused", href: "/campaigns/paused" },
      { label: "Completed", href: "/campaigns/completed" },
    ],
  },
  { label: "Analytics", href: "/analytics" },
  { label: "Creator Performance", href: "/creators" },
  {
    label: "Wallet",
    href: "/wallet",
    children: [
      { label: "Overview", href: "/wallet/overview" },
      { label: "Add Funds", href: "/wallet/add-funds" },
      { label: "Transactions", href: "/wallet/transactions" },
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    children: [
      { label: "Payments", href: "/billing/payments" },
      { label: "Invoices", href: "/billing/invoices" },
      { label: "Refunds", href: "/billing/refunds" },
    ],
  },
  { label: "Reports", href: "/reports" },
  { label: "Team Members", href: "/team" },
  { label: "Notifications", href: "/notifications" },
  { label: "Support", href: "/support" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];
