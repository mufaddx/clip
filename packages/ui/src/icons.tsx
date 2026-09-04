import * as React from "react";

// Shared nav/UI icon set — see docs/ui-ux/COMPONENT_LIBRARY.md. Hand-rolled
// inline SVGs (consistent 1.6px stroke, 24x24 viewBox) rather than an
// external icon package, matching the rest of this design system's
// zero-extra-dependency approach.
type IconProps = React.SVGProps<SVGSVGElement>;

function base(paths: React.ReactNode) {
  return function Icon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const IconDashboard = base(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>
);

export const IconMegaphone = base(
  <>
    <path d="M3 11v2a2 2 0 0 0 2 2h1l3.5 5 1-.3-1-4.7h6.5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9L5.5 2 4.5 2.3l1 4.7H5a2 2 0 0 0-2 2Z" />
    <path d="M17 8v8" />
  </>
);

export const IconInstagram = base(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </>
);

export const IconChart = base(
  <>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 15l3-4 3 2 4-6" />
  </>
);

export const IconWallet = base(
  <>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <path d="M16 14h2" />
    <path d="M7 6V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
  </>
);

export const IconArrowDownCircle = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v6" />
    <path d="M9 12l3 3 3-3" />
  </>
);

export const IconCoin = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 15c0 1 1 1.5 2.5 1.5s2.5-.6 2.5-1.6c0-2.3-5-1-5-3.4 0-1 1-1.6 2.5-1.6s2.5.5 2.5 1.5" />
    <path d="M12 7.5v9" />
  </>
);

export const IconGift = base(
  <>
    <rect x="3" y="9" width="18" height="4" rx="1" />
    <rect x="5" y="13" width="14" height="8" rx="1" />
    <path d="M12 9v12" />
    <path d="M12 9C10.5 9 8 8.3 8 6.2 8 4.8 9 4 10 4c1.6 0 2 2.6 2 5Z" />
    <path d="M12 9c1.5 0 4-.7 4-2.8 0-1.4-1-2.2-2-2.2-1.6 0-2 2.6-2 5Z" />
  </>
);

export const IconBell = base(
  <>
    <path d="M18 8a6 6 0 1 0-12 0c0 3-1 5-2 6h16c-1-1-2-3-2-6Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>
);

export const IconLifebuoy = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M5.6 5.6l3 3M15.4 15.4l3 3M18.4 5.6l-3 3M8.6 15.4l-3 3" />
  </>
);

export const IconUser = base(
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c0-3.6 3-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
  </>
);

export const IconSettings = base(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M3 12h2.2M18.8 12H21M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
  </>
);

export const IconUsers = base(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17.5" cy="9" r="2.3" />
    <path d="M15.7 14.2c2.4.5 4.3 2.5 4.3 5.3" />
  </>
);

export const IconBriefcase = base(
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </>
);

export const IconReceipt = base(
  <>
    <path d="M6 2h12v20l-2-1.5L14 22l-2-1.5L10 22l-2-1.5L6 22Z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </>
);

export const IconFileText = base(
  <>
    <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 16h6" />
  </>
);

export const IconShield = base(
  <path d="M12 3l7 3v6c0 5-3.2 7.7-7 9-3.8-1.3-7-4-7-9V6l7-3Z M9.5 12l2 2 3.5-4" />
);

export const IconLayers = base(
  <>
    <path d="M12 3l8 4.2-8 4.2-8-4.2L12 3Z" />
    <path d="M4 12l8 4.2 8-4.2" />
    <path d="M4 16.2l8 4.2 8-4.2" />
  </>
);

export const IconFlag = base(
  <>
    <path d="M6 3v18" />
    <path d="M6 4h11l-2.5 4L17 12H6" />
  </>
);

export const IconAlertTriangle = base(
  <>
    <path d="M12 4l9 16H3Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
  </>
);

export const IconCopy = base(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </>
);

export const IconCheck = base(<path d="M5 12.5l4.5 4.5L19 7" />);

export const IconRefresh = base(
  <>
    <path d="M20 11a8 8 0 0 0-14.6-4.6M4 13a8 8 0 0 0 14.6 4.6" />
    <path d="M5 3v4h4M19 21v-4h-4" />
  </>
);
