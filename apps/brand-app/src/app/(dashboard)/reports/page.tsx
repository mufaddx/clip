import { PageHeader, Card, StatCard, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client.server";

interface BrandOverview {
  totalCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalQualifiedPerformance: number;
}

// /reports — see docs/operations/REPORTING_SYSTEM.md. PDF/CSV export isn't
// wired up yet; this renders the same underlying data reports would use.
export default async function ReportsPage() {
  const overview = await apiFetch<BrandOverview>("/v1/analytics/brand").catch(() => null);

  return (
    <div>
      <PageHeader title="Reports" description="Export coming in a later pass — the underlying figures are live." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Campaigns" value={overview?.totalCampaigns ?? 0} />
        <StatCard label="Total Budget" value={formatCurrency(overview?.totalBudget ?? 0)} />
        <StatCard label="Total Spent" value={formatCurrency(overview?.totalSpent ?? 0)} />
        <StatCard label="Qualified Performance" value={overview?.totalQualifiedPerformance?.toFixed(2) ?? "0"} />
      </div>
      <Card className="mt-6">
        <EmptyState title="PDF/CSV export isn't available yet" description="See docs/operations/REPORTING_SYSTEM.md." />
      </Card>
    </div>
  );
}
