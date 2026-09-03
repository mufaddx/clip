import * as React from "react";

// Hand-rolled inline icon set for the marketing site — kept local to
// public-web (rather than @clip/ui) since these are decorative/marketing
// icons, not part of the shared product component library. Consistent
// 1.5px stroke, 24x24 viewBox, no external icon package dependency.
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

export const IconMegaphone = base(
  <>
    <path d="M3 11v2a2 2 0 0 0 2 2h1l3.5 5 1-.3-1-4.7h6.5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9L5.5 2 4.5 2.3l1 4.7H5a2 2 0 0 0-2 2Z" />
    <path d="M17 8v8" />
  </>
);

export const IconTarget = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
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

export const IconChart = base(
  <>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 15l3-4 3 2 4-6" />
  </>
);

export const IconInstagram = base(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </>
);

export const IconShield = base(
  <path d="M12 3l7 3v6c0 5-3.2 7.7-7 9-3.8-1.3-7-4-7-9V6l7-3Z M9.5 12l2 2 3.5-4" />
);

export const IconLink = base(
  <>
    <path d="M9.5 14.5l5-5" />
    <path d="M8 16l-1.5 1.5a3.2 3.2 0 0 1-4.5-4.5L5.5 10.5" />
    <path d="M16 8l1.5-1.5a3.2 3.2 0 0 1 4.5 4.5L20.5 13.5" />
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

export const IconGift = base(
  <>
    <rect x="3" y="9" width="18" height="4" rx="1" />
    <rect x="5" y="13" width="14" height="8" rx="1" />
    <path d="M12 9v12" />
    <path d="M12 9C10.5 9 8 8.3 8 6.2 8 4.8 9 4 10 4c1.6 0 2 2.6 2 5Z" />
    <path d="M12 9c1.5 0 4-.7 4-2.8 0-1.4-1-2.2-2-2.2-1.6 0-2 2.6-2 5Z" />
  </>
);

export const IconLock = base(
  <>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15" r="1.4" />
  </>
);

export const IconCheckCircle = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.3 12.3l2.4 2.4 5-5.4" />
  </>
);

export const IconArrowRight = base(<path d="M4 12h16M14 6l6 6-6 6" />);

export const IconSparkle = base(
  <>
    <path d="M12 3v4M12 17v4M4.2 12H8M16 12h3.8M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" />
  </>
);

export const IconClock = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>
);

export const IconLayers = base(
  <>
    <path d="M12 3l8 4.2-8 4.2-8-4.2L12 3Z" />
    <path d="M4 12l8 4.2 8-4.2" />
    <path d="M4 16.2l8 4.2 8-4.2" />
  </>
);
