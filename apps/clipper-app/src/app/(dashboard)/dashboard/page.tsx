import { PageHeader, StatCard, Card, CardHeader, CardTitle, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";

// Clipper dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Clipper dashboard home".
// Stat values are hardcoded zeros here; wiring to real data (via the API
// client reading /v1/wallet, /v1/campaigns, /v1/performance) lands once
// those modules are implemented — see docs/README.md implementation status.
export default function ClipperDashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Your campaigns, performance, and earnings at a glance." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Available Earnings" value={formatCurrency(0)} />
        <StatCard label="Pending Earnings" value={formatCurrency(0)} />
        <StatCard label="Total Earnings" value={formatCurrency(0)} />
        <StatCard label="Qualified Performance" value="0" />
        <StatCard label="Active Campaigns" value="0" />
        <StatCard label="Completed Campaigns" value="0" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <EmptyState
            title="No performance data yet"
            description="Accept a campaign and publish your first reel to see your performance trend here."
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Health</CardTitle>
          </CardHeader>
          <EmptyState
            title="Connect your Instagram account"
            description="Required before you can accept a campaign."
          />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Campaigns</CardTitle>
          </CardHeader>
          <EmptyState
            title="No campaigns yet"
            description="We'll show campaigns here once your profile and categories are set."
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <EmptyState title="Nothing here yet" />
        </Card>
      </div>
    </div>
  );
}
