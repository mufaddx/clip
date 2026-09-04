import * as React from "react";
import { cn } from "./cn";

// Status → token mapping per docs/ui-ux/DESIGN_TOKENS.md.
export type BadgeVariant = "neutral" | "warning" | "success" | "info" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-600",
  warning: "bg-warning-50 text-warning-700",
  success: "bg-success-50 text-success-700",
  info: "bg-info-50 text-info-700",
  danger: "bg-danger-50 text-danger-700",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * Maps a campaign lifecycle status (docs/campaigns/CAMPAIGN_LIFECYCLE.md) to
 * its badge variant + label in one place, so every app renders it identically.
 */
const CAMPAIGN_STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: "Draft", variant: "neutral" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "info" },
  FUNDED: { label: "Funded", variant: "info" },
  LIVE: { label: "Live", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "info" },
  REJECTED: { label: "Rejected", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  EXPIRED: { label: "Expired", variant: "danger" },
  // Reel verification statuses (docs/campaigns/REEL_VERIFICATION.md) share
  // this same badge component wherever a reel's status is shown.
  PENDING_VERIFICATION: { label: "Verifying…", variant: "warning" },
  VERIFIED: { label: "Verified", variant: "success" },
  MANUAL_REVIEW: { label: "Needs Review", variant: "warning" },
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const entry = CAMPAIGN_STATUS_MAP[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
