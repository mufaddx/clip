import { PageHeader, StatCard, Card, CardHeader, CardTitle, EmptyState, Button } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import Link from "next/link";

// Brand dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Brand dashboard home".
export default function BrandDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your campaigns, spend, and creator performance at a glance."
        action={
          <Link href="/campaigns/create">
            <Button>Create Campaign</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Campaigns" value="0" />
        <StatCard label="Total Campaigns" value="0" />
        <StatCard label="Campaign Performance" value="0" />
        <StatCard label="Qualified Performance" value="0" />
        <StatCard label="Budget Used" value={formatCurrency(0)} />
        <StatCard label="Wallet Balance" value={formatCurrency(0)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <EmptyState
            title="Create your first campaign"
            description="Launch a campaign to see performance results here."
            action={
              <Link href="/campaigns/create">
                <Button variant="secondary">Create Campaign</Button>
              </Link>
            }
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Usage</CardTitle>
          </CardHeader>
          <EmptyState title="No budget allocated yet" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <EmptyState title="No active campaigns" />
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
