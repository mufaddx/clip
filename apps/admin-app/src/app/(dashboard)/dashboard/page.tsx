import { PageHeader, StatCard, Card, CardHeader, CardTitle, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";

// Admin dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Admin dashboard home".
export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Platform-wide activity and pending actions." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        <StatCard label="Total Users" value="0" />
        <StatCard label="Total Brands" value="0" />
        <StatCard label="Total Clippers" value="0" />
        <StatCard label="Active Campaigns" value="0" />
        <StatCard label="Total Campaign Budget" value={formatCurrency(0)} />
        <StatCard label="Platform Revenue" value={formatCurrency(0)} />
        <StatCard label="Total Qualified Performance" value="0" />
        <StatCard label="Pending Withdrawals" value="0" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth &amp; Campaign Performance</CardTitle>
          </CardHeader>
          <EmptyState title="No data yet" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <EmptyState title="Nothing to report" description="Queues, jobs, and integrations are healthy." />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <EmptyState title="Nothing waiting for review" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Alerts</CardTitle>
          </CardHeader>
          <EmptyState title="No active alerts" />
        </Card>
      </div>
    </div>
  );
}
