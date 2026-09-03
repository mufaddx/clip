import type { NavItem } from "@clip/ui";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Clipper (clipper.domain.in)".
export const clipperNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Campaigns",
    href: "/campaigns",
    children: [
      { label: "Recommended", href: "/campaigns/recommended" },
      { label: "Available", href: "/campaigns/available" },
      { label: "Invited", href: "/campaigns/invited" },
      { label: "Active", href: "/campaigns/active" },
      { label: "Submitted", href: "/campaigns/submitted" },
      { label: "Tracking", href: "/campaigns/tracking" },
      { label: "Completed", href: "/campaigns/completed" },
    ],
  },
  {
    label: "My Instagram",
    href: "/instagram",
    children: [
      { label: "Connected Accounts", href: "/instagram/accounts" },
      { label: "Account Performance", href: "/instagram/performance" },
    ],
  },
  { label: "Analytics", href: "/analytics" },
  { label: "Earnings", href: "/earnings" },
  { label: "Wallet", href: "/wallet" },
  { label: "Withdrawals", href: "/withdrawals" },
  { label: "Referral Program", href: "/referrals" },
  { label: "Notifications", href: "/notifications" },
  { label: "Support", href: "/support" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];
