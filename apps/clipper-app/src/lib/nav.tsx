import {
  IconDashboard,
  IconMegaphone,
  IconInstagram,
  IconChart,
  IconCoin,
  IconWallet,
  IconArrowDownCircle,
  IconGift,
  IconBell,
  IconLifebuoy,
  IconUser,
  IconSettings,
  type NavItem,
} from "@clip/ui";

// See docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Clipper (clipper.domain.in)".
// "My Instagram" is a single page (apps/clipper-app/src/app/(dashboard)/instagram) —
// it previously linked to /instagram/accounts and /instagram/performance,
// neither of which exists, so those sub-items 404'd. Flattened to the one
// real route rather than building two pages that duplicate what it already
// shows.
export const clipperNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <IconDashboard /> },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: <IconMegaphone />,
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
  { label: "My Instagram", href: "/instagram", icon: <IconInstagram /> },
  { label: "Analytics", href: "/analytics", icon: <IconChart /> },
  { label: "Earnings", href: "/earnings", icon: <IconCoin /> },
  { label: "Wallet", href: "/wallet", icon: <IconWallet /> },
  { label: "Withdrawals", href: "/withdrawals", icon: <IconArrowDownCircle /> },
  { label: "Referral Program", href: "/referrals", icon: <IconGift /> },
  { label: "Notifications", href: "/notifications", icon: <IconBell /> },
  { label: "Support", href: "/support", icon: <IconLifebuoy /> },
  { label: "Profile", href: "/profile", icon: <IconUser /> },
  { label: "Settings", href: "/settings", icon: <IconSettings /> },
];
