"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, CardHeader, CardTitle, Button, CampaignStatusBadge, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { Campaign } from "../../../../lib/types";
import { CampaignsListView } from "../../../../components/campaigns-list-view";

// See docs/ui-ux/PAGE_SPECIFICATIONS.md "Brand app" — a single dynamic
// segment handles both the sidebar's status-filtered list links (All
// Campaigns, Drafts, Pending, Active, Paused, Completed — see lib/nav.tsx)
// and the /campaigns/[id] detail page, since Next.js disallows two
// differently-named dynamic segments at the same path position. This used
// to be named [id] and only ever treated the segment as a literal campaign
// id, so every one of those sidebar links 404'd with "Campaign not found."
const SEGMENT_TAB: Record<string, string> = {
  all: "ALL",
  drafts: "DRAFT",
  pending: "PENDING_REVIEW",
  active: "LIVE",
  paused: "PAUSED",
  completed: "COMPLETED",
};

export default function CampaignSegmentPage() {
  const params = useParams<{ segment: string }>();
  const segment = params.segment;

  if (segment in SEGMENT_TAB) {
    return <CampaignsListView initialTab={SEGMENT_TAB[segment]} />;
  }
  return <CampaignDetail campaignId={segment} />;
}

interface CreatorRow {
  id: string;
  status: string;
  creator: { displayName: string; trustScore: number };
  reels: Array<{ id: string; status: string; calculations: Array<{ score: number }> }>;
}

function CampaignDetail({ campaignId }: { campaignId: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [creators, setCreators] = useState<CreatorRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const c = await apiFetchClient<Campaign>(`/v1/campaigns/${campaignId}`);
      setCampaign(c);
      const cr = await apiFetchClient<CreatorRow[]>(`/v1/campaigns/${campaignId}/creators`);
      setCreators(cr);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load campaign.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function action(path: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient(`/v1/campaigns/${campaignId}/${path}`, { method: "POST" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!campaign) return <EmptyState title={error ?? "Loading…"} />;

  return (
    <div>
      <PageHeader title={campaign.name} action={<CampaignStatusBadge status={campaign.status} />} />
      {error ? <p className="mb-4 text-sm text-danger-600">{error}</p> : null}
      {campaign.rejectedReason ? <p className="mb-4 text-sm text-danger-600">Rejected: {campaign.rejectedReason}</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Budget</CardTitle></CardHeader>
          <p className="text-sm">Creator budget: {formatCurrency(campaign.creatorBudget)}</p>
          <p className="text-sm">Locked: {formatCurrency(campaign.lockedAmount)}</p>
          <p className="text-sm">Spent: {formatCurrency(campaign.spentAmount)}</p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2">
            {campaign.status === "DRAFT" && <Button loading={busy} onClick={() => action("submit")}>Submit for Review</Button>}
            {campaign.status === "APPROVED" && <Button loading={busy} onClick={() => action("fund")}>Fund &amp; Launch</Button>}
            {campaign.status === "LIVE" && <Button variant="secondary" loading={busy} onClick={() => action("pause")}>Pause</Button>}
            {campaign.status === "PAUSED" && <Button loading={busy} onClick={() => action("resume")}>Resume</Button>}
            {["LIVE", "PAUSED"].includes(campaign.status) && <Button variant="secondary" loading={busy} onClick={() => action("complete")}>Complete</Button>}
            {!["COMPLETED", "CANCELLED", "REJECTED"].includes(campaign.status) && (
              <Button variant="destructive" loading={busy} onClick={() => action("cancel")}>Cancel</Button>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Creators</CardTitle></CardHeader>
        {creators === null ? (
          <EmptyState title="Loading…" />
        ) : creators.length === 0 ? (
          <EmptyState title="No creators yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Creator</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Reels</TableHeaderCell>
                <TableHeaderCell className="text-right">Latest Score</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {creators.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.creator.displayName}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>{c.reels.length}</TableCell>
                  <TableCell className="text-right">{c.reels[0]?.calculations[0]?.score.toFixed(3) ?? "—"}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
