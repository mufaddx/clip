import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, CardTitle, EmptyState, CampaignStatusBadge, Button } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client";
import type { Campaign, Wallet } from "../../../lib/types";

interface BrandOverview {
  activeCampaigns: number;
  totalCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalQualifiedPerformance: number;
}

// Brand dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Brand dashboard home".
export default async function BrandDashboardPage() {
  const [walletRes, overviewRes, campaignsRes] = await Promise.allSettled([
    apiFetch<Wallet>("/v1/wallet"),
    apiFetch<BrandOverview>("/v1/analytics/brand"),
    apiFetch<Campaign[]>("/v1/campaigns?status=LIVE"),
  ]);

  const wallet = walletRes.status === "fulfilled" ? walletRes.value : null;
  const overview = overviewRes.status === "fulfilled" ? overviewRes.value : null;
  const activeCampaigns = campaignsRes.status === "fulfilled" ? campaignsRes.value : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your campaigns, spend, and creator performance at a glance."
        action={<Link href="/campaigns/create"><Button>Create Campaign</Button></Link>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Campaigns" value={overview?.activeCampaigns ?? 0} />
        <StatCard label="Total Campaigns" value={overview?.totalCampaigns ?? 0} />
        <StatCard label="Campaign Performance" value={overview?.totalQualifiedPerformance?.toFixed(2) ?? "0"} />
        <StatCard label="Qualified Performance" value={overview?.totalQualifiedPerformance?.toFixed(2) ?? "0"} />
        <StatCard label="Budget Used" value={formatCurrency(overview?.totalSpent ?? 0)} />
        <StatCard label="Wallet Balance" value={formatCurrency(wallet?.availableBalance ?? 0)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
          {activeCampaigns.length === 0 ? (
            <EmptyState
              title="Create your first campaign"
              description="Launch a campaign to see performance results here."
              action={<Link href="/campaigns/create"><Button variant="secondary">Create Campaign</Button></Link>}
            />
          ) : (
            <ul className="space-y-2">
              {activeCampaigns.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <Link href={`/campaigns/${c.id}`} className="font-medium text-brand-600 hover:underline">{c.name}</Link>
                  <CampaignStatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle>Budget Usage</CardTitle></CardHeader>
          <p className="text-sm">Locked: {formatCurrency(overview?.totalBudget ?? 0)}</p>
          <p className="text-sm">Spent: {formatCurrency(overview?.totalSpent ?? 0)}</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Creator Activity</CardTitle></CardHeader>
          <EmptyState title="Nothing here yet" />
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <EmptyState title="Nothing here yet" />
        </Card>
      </div>
    </div>
  );
}
