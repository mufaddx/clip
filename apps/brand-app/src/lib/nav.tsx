import {
  IconDashboard,
  IconMegaphone,
  IconChart,
  IconUsers,
  IconWallet,
  IconReceipt,
  IconFileText,
  IconBriefcase,
  IconBell,
  IconLifebuoy,
  IconUser,
  IconSettings,
  type NavItem,
} from "@clip/ui";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Brand (brand.domain.in)".
export const brandNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <IconDashboard /> },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: <IconMegaphone />,
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
  { label: "Analytics", href: "/analytics", icon: <IconChart /> },
  { label: "Creator Performance", href: "/creators", icon: <IconUsers /> },
  {
    label: "Wallet",
    href: "/wallet",
    icon: <IconWallet />,
    children: [
      { label: "Overview", href: "/wallet/overview" },
      { label: "Add Funds", href: "/wallet/add-funds" },
      { label: "Transactions", href: "/wallet/transactions" },
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: <IconReceipt />,
    children: [
      { label: "Payments", href: "/billing/payments" },
      { label: "Invoices", href: "/billing/invoices" },
      { label: "Refunds", href: "/billing/refunds" },
    ],
  },
  { label: "Reports", href: "/reports", icon: <IconFileText /> },
  { label: "Team Members", href: "/team", icon: <IconBriefcase /> },
  { label: "Notifications", href: "/notifications", icon: <IconBell /> },
  { label: "Support", href: "/support", icon: <IconLifebuoy /> },
  { label: "Profile", href: "/profile", icon: <IconUser /> },
  { label: "Settings", href: "/settings", icon: <IconSettings /> },
];
