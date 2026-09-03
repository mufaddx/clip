import { PageHeader, StatCard, Card, CardHeader, CardTitle, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client";
import type { PlatformOverview } from "../../../lib/types";

// Admin dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Admin dashboard home".
export default async function AdminDashboardPage() {
  const overview = await apiFetch<PlatformOverview>("/v1/analytics/platform").catch(() => null);

  return (
    <div>
      <PageHeader title="Dashboard" description="Platform-wide activity and pending actions." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={overview?.totalUsers ?? 0} />
        <StatCard label="Total Brands" value={overview?.totalBrands ?? 0} />
        <StatCard label="Total Clippers" value={overview?.totalClippers ?? 0} />
        <StatCard label="Active Campaigns" value={overview?.activeCampaigns ?? 0} />
        <StatCard label="Total Campaign Budget" value={formatCurrency(overview?.totalCampaignBudget ?? 0)} />
        <StatCard label="Platform Revenue" value={formatCurrency(overview?.platformRevenue ?? 0)} />
        <StatCard label="Total Qualified Performance" value={overview?.totalQualifiedPerformance?.toFixed(2) ?? "0"} />
        <StatCard label="Pending Withdrawals" value={overview?.pendingWithdrawals ?? 0} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>User Growth &amp; Campaign Performance</CardTitle></CardHeader>
          <EmptyState title="No chart yet" description="A real chart library lands in a later pass." />
        </Card>
        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <EmptyState title="Nothing to report" description="Queues, jobs, and integrations are healthy." />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Pending Actions</CardTitle></CardHeader>
          <p className="text-sm text-slate-600">{overview?.pendingWithdrawals ?? 0} withdrawal(s) awaiting processing.</p>
        </Card>
        <Card>
          <CardHeader><CardTitle>Risk Alerts</CardTitle></CardHeader>
          <EmptyState title="Check Clippers → Risk Review for flagged accounts" />
        </Card>
      </div>
    </div>
  );
}
