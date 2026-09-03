import type { NavItem } from "@clip/ui";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Admin (admin.domain.in)".
export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "User Management",
    href: "/users",
    children: [
      { label: "All Users", href: "/users/all" },
      { label: "Brands", href: "/users/brands" },
      { label: "Clippers", href: "/users/clippers" },
      { label: "Admin Team", href: "/users/admin-team" },
      { label: "Suspended", href: "/users/suspended" },
    ],
  },
  {
    label: "Campaign Management",
    href: "/campaigns",
    children: [
      { label: "All", href: "/campaigns/all" },
      { label: "Pending Approval", href: "/campaigns/pending-approval" },
      { label: "Active", href: "/campaigns/active" },
      { label: "Paused", href: "/campaigns/paused" },
      { label: "Completed", href: "/campaigns/completed" },
      { label: "Rejected", href: "/campaigns/rejected" },
    ],
  },
  {
    label: "Creator Management",
    href: "/clippers",
    children: [
      { label: "All Clippers", href: "/clippers/all" },
      { label: "Verification", href: "/clippers/verification" },
      { label: "Performance", href: "/clippers/performance" },
      { label: "Risk Review", href: "/clippers/risk-review" },
    ],
  },
  {
    label: "Instagram",
    href: "/instagram",
    children: [
      { label: "Connected Accounts", href: "/instagram/connected-accounts" },
      { label: "Connection Health", href: "/instagram/connection-health" },
      { label: "Errors", href: "/instagram/errors" },
    ],
  },
  {
    label: "Performance",
    href: "/performance",
    children: [
      { label: "Overview", href: "/performance/overview" },
      { label: "Metric Tracking", href: "/performance/metric-tracking" },
      { label: "Qualified Performance", href: "/performance/qualified-performance" },
      { label: "Suspicious Activity", href: "/performance/suspicious-activity" },
    ],
  },
  {
    label: "Finance",
    href: "/finance",
    children: [
      { label: "Platform Wallet", href: "/finance/platform-wallet" },
      { label: "Payments", href: "/finance/payments" },
      { label: "Earnings", href: "/finance/earnings" },
      { label: "Withdrawals", href: "/finance/withdrawals" },
      { label: "Refunds", href: "/finance/refunds" },
      { label: "Transactions", href: "/finance/transactions" },
    ],
  },
  {
    label: "Referral System",
    href: "/referrals",
    children: [
      { label: "Overview", href: "/referrals/overview" },
      { label: "Referrals", href: "/referrals/list" },
      { label: "Rewards", href: "/referrals/rewards" },
      { label: "Rules", href: "/referrals/rules" },
    ],
  },
  { label: "Support", href: "/support" },
  { label: "Disputes", href: "/disputes" },
  { label: "Content Moderation", href: "/moderation" },
  { label: "Reports", href: "/reports" },
  { label: "Notifications", href: "/notifications" },
  { label: "Settings", href: "/settings" },
  {
    label: "Security",
    href: "/security",
    children: [
      { label: "Audit Logs", href: "/security/audit-logs" },
      { label: "Security Events", href: "/security/security-events" },
    ],
  },
];
