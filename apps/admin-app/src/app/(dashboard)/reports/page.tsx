import { PageHeader, Card, StatCard, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client.server";
import type { PlatformOverview } from "../../../lib/types";

// /reports — see docs/operations/REPORTING_SYSTEM.md. Export isn't wired up yet.
export default async function AdminReportsPage() {
  const overview = await apiFetch<PlatformOverview>("/v1/analytics/platform").catch(() => null);

  return (
    <div>
      <PageHeader title="Reports" description="Platform-wide operational figures. Export is a later pass." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={overview?.totalUsers ?? 0} />
        <StatCard label="Active Campaigns" value={overview?.activeCampaigns ?? 0} />
        <StatCard label="Platform Revenue" value={formatCurrency(overview?.platformRevenue ?? 0)} />
        <StatCard label="Pending Withdrawals" value={overview?.pendingWithdrawals ?? 0} />
      </div>
      <Card className="mt-6">
        <EmptyState title="Export isn't available yet" />
      </Card>
    </div>
  );
}
