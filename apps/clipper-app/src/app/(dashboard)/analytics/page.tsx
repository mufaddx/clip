"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardHeader, CardTitle, EmptyState } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";

interface ClipperOverview {
  totalQualifiedPerformance: number;
  performanceTrend: Array<{ score: number; computedAt: string }>;
}

// /analytics — see docs/operations/ANALYTICS_SYSTEM.md "Clipper analytics".
// Rendered as a simple list rather than a chart for now — see the dataviz
// skill for the real charting conventions once a chart library is wired in.
export default function ClipperAnalyticsPage() {
  const [overview, setOverview] = useState<ClipperOverview | null>(null);

  useEffect(() => {
    apiFetchClient<ClipperOverview>("/v1/analytics/clipper").then(setOverview).catch(() => setOverview(null));
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" description="Your qualified performance trend across campaigns." />
      <Card>
        <CardHeader><CardTitle>Performance trend</CardTitle></CardHeader>
        {!overview ? (
          <EmptyState title="Loading…" />
        ) : overview.performanceTrend.length === 0 ? (
          <EmptyState title="No performance data yet" description="Accept a campaign and publish your first reel to see your trend here." />
        ) : (
          <ul className="space-y-1 text-sm">
            {overview.performanceTrend.map((p, i) => (
              <li key={i} className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">{formatDate(p.computedAt)}</span>
                <span className="font-medium text-ink">{p.score.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
