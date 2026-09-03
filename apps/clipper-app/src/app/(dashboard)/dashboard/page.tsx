import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, CardTitle, EmptyState, CampaignStatusBadge, Badge } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client.server";
import type { Campaign, InstagramAccount, Wallet } from "../../../lib/types";

interface ClipperOverview {
  activeCampaigns: number;
  completedCampaigns: number;
  totalQualifiedPerformance: number;
}

// Clipper dashboard home — see docs/ui-ux/DASHBOARD_LAYOUTS.md "Clipper dashboard home".
// Each section fetches independently (Promise.allSettled) so one failing
// call doesn't blank the whole page — see docs/ui-ux/LOADING_STATES.md.
export default async function ClipperDashboardPage() {
  const [walletRes, overviewRes, availableRes, instagramRes] = await Promise.allSettled([
    apiFetch<Wallet>("/v1/wallet"),
    apiFetch<ClipperOverview>("/v1/analytics/clipper"),
    apiFetch<Campaign[]>("/v1/campaigns/available"),
    apiFetch<InstagramAccount[]>("/v1/instagram/accounts"),
  ]);

  const wallet = walletRes.status === "fulfilled" ? walletRes.value : null;
  const overview = overviewRes.status === "fulfilled" ? overviewRes.value : null;
  const available = availableRes.status === "fulfilled" ? availableRes.value : [];
  const accounts = instagramRes.status === "fulfilled" ? instagramRes.value : [];

  return (
    <div>
      <PageHeader title="Dashboard" description="Your campaigns, performance, and earnings at a glance." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Available Earnings" value={formatCurrency(wallet?.availableBalance ?? 0)} />
        <StatCard label="Pending Earnings" value={formatCurrency(wallet?.pendingBalance ?? 0)} />
        <StatCard label="Total Earnings" value={formatCurrency((wallet?.availableBalance ?? 0) + (wallet?.pendingBalance ?? 0) + (wallet?.withdrawnBalance ?? 0))} />
        <StatCard label="Qualified Performance" value={overview?.totalQualifiedPerformance.toFixed(2) ?? "0"} />
        <StatCard label="Active Campaigns" value={overview?.activeCampaigns ?? 0} />
        <StatCard label="Completed Campaigns" value={overview?.completedCampaigns ?? 0} />
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
          {accounts.length === 0 ? (
            <EmptyState title="Connect your Instagram account" description="Required before you can accept a campaign." />
          ) : (
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span>@{a.username}</span>
                  <Badge variant={a.connectionHealth === "HEALTHY" ? "success" : "danger"}>{a.connectionHealth}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Campaigns</CardTitle>
          </CardHeader>
          {available.length === 0 ? (
            <EmptyState title="No campaigns yet" description="We'll show campaigns here once your profile and categories are set." />
          ) : (
            <ul className="space-y-2">
              {available.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <Link href={`/campaigns/${c.id}`} className="font-medium text-brand-600 hover:underline">
                    {c.name}
                  </Link>
                  <CampaignStatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
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
