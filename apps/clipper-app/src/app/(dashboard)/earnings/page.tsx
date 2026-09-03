"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, StatCard, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";
import type { CampaignAcceptance } from "../../../lib/types";

interface ClipperOverview {
  activeCampaigns: number;
  completedCampaigns: number;
  totalQualifiedPerformance: number;
}

// /earnings — see docs/ui-ux/PAGE_SPECIFICATIONS.md and docs/finance/CREATOR_EARNINGS.md.
export default function EarningsPage() {
  const [overview, setOverview] = useState<ClipperOverview | null>(null);
  const [acceptances, setAcceptances] = useState<CampaignAcceptance[] | null>(null);

  useEffect(() => {
    apiFetchClient<ClipperOverview>("/v1/analytics/clipper").then(setOverview).catch(() => setOverview(null));
    apiFetchClient<CampaignAcceptance[]>("/v1/campaigns/mine").then(setAcceptances).catch(() => setAcceptances([]));
  }, []);

  return (
    <div>
      <PageHeader title="Earnings" description="Per-campaign earnings breakdown." />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Qualified performance (total)" value={overview?.totalQualifiedPerformance?.toFixed(2) ?? "0"} loading={!overview} />
        <StatCard label="Active campaigns" value={overview?.activeCampaigns ?? 0} loading={!overview} />
        <StatCard label="Completed campaigns" value={overview?.completedCampaigns ?? 0} loading={!overview} />
      </div>

      <Card className="mt-6">
        {acceptances === null ? (
          <EmptyState title="Loading…" />
        ) : acceptances.length === 0 ? (
          <EmptyState title="No campaigns yet" description="Accept a campaign to start earning." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {acceptances.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{a.campaign.name}</p>
                  <p className="text-sm text-slate-500">{a.reels.length} reel(s) submitted</p>
                </div>
                <p className="text-sm text-slate-500">Budget: {formatCurrency(a.campaign.creatorBudget)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
