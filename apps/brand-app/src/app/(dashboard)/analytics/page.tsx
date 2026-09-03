import { PageHeader, Card, CardHeader, CardTitle, StatCard, EmptyState } from "@clip/ui";
import { formatCurrency, formatDate } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client.server";

interface BrandOverview {
  activeCampaigns: number;
  totalCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalQualifiedPerformance: number;
  performanceTrend: Array<{ score: number; computedAt: string }>;
}

// /analytics — see docs/operations/ANALYTICS_SYSTEM.md "Brand analytics".
export default async function BrandAnalyticsPage() {
  const overview = await apiFetch<BrandOverview>("/v1/analytics/brand").catch(() => null);

  return (
    <div>
      <PageHeader title="Analytics" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active Campaigns" value={overview?.activeCampaigns ?? 0} />
        <StatCard label="Total Campaigns" value={overview?.totalCampaigns ?? 0} />
        <StatCard label="Budget Locked" value={formatCurrency(overview?.totalBudget ?? 0)} />
        <StatCard label="Spent" value={formatCurrency(overview?.totalSpent ?? 0)} />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Performance trend</CardTitle></CardHeader>
        {!overview || overview.performanceTrend.length === 0 ? (
          <EmptyState title="No performance data yet" />
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
