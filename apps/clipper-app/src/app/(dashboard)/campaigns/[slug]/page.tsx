"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, CampaignStatusBadge, Table, TableHead, TableRow, TableHeaderCell, TableCell, Button } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { Campaign, CampaignAcceptance } from "../../../../lib/types";
import { CampaignDetail } from "../../../../components/campaign-detail";

// See docs/ui-ux/PAGE_SPECIFICATIONS.md — clipper campaign routes. A single
// dynamic segment handles both the 7 tab list pages and the /campaigns/[id]
// detail page, since Next.js disallows two differently-named dynamic
// segments at the same path position.
const TAB_KEYWORDS = ["recommended", "available", "invited", "active", "submitted", "tracking", "completed"] as const;
type Tab = (typeof TAB_KEYWORDS)[number];

const TAB_LABELS: Record<Tab, string> = {
  recommended: "Recommended",
  available: "Available",
  invited: "Invited",
  active: "Active",
  submitted: "Submitted",
  tracking: "Tracking",
  completed: "Completed",
};

export default function CampaignSlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  if ((TAB_KEYWORDS as readonly string[]).includes(slug)) {
    return <CampaignListPage tab={slug as Tab} />;
  }
  return <CampaignDetail campaignAcceptanceOrId={slug} />;
}

function CampaignListPage({ tab }: { tab: Tab }) {
  const [available, setAvailable] = useState<Campaign[] | null>(null);
  const [mine, setMine] = useState<CampaignAcceptance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "recommended" || tab === "available") {
      apiFetchClient<Campaign[]>("/v1/campaigns/available").then(setAvailable).catch((e) => setError(e.message));
    } else {
      apiFetchClient<CampaignAcceptance[]>("/v1/campaigns/mine").then(setMine).catch((e) => setError(e.message));
    }
  }, [tab]);

  const filteredMine = mine?.filter((a) => {
    if (tab === "invited") return false; // invitations aren't implemented yet — see docs/campaigns/CREATOR_MATCHING.md
    if (tab === "active") return ["ACCEPTED", "SUBMITTED", "TRACKING"].includes(a.status);
    if (tab === "submitted") return a.status === "SUBMITTED";
    if (tab === "tracking") return a.status === "TRACKING";
    if (tab === "completed") return a.status === "COMPLETED";
    return true;
  });

  return (
    <div>
      <PageHeader title={`Campaigns — ${TAB_LABELS[tab]}`} />
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}

      {tab === "invited" ? (
        <Card>
          <EmptyState title="No invitations yet" description="Targeted invitations from brands will show up here." />
        </Card>
      ) : tab === "recommended" || tab === "available" ? (
        <CampaignGrid campaigns={available} />
      ) : (
        <AcceptanceGrid acceptances={filteredMine ?? null} />
      )}
    </div>
  );
}

function CampaignGrid({ campaigns }: { campaigns: Campaign[] | null }) {
  if (campaigns === null) return <Card><EmptyState title="Loading…" /></Card>;
  if (campaigns.length === 0) {
    return <Card><EmptyState title="No campaigns yet" description="We'll show campaigns here once your profile and categories are set." /></Card>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((c) => (
        <Card key={c.id}>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-ink">{c.name}</h3>
            <CampaignStatusBadge status={c.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{c.objective.replace("_", " ")}</p>
          <p className="mt-3 text-sm text-slate-600">Budget: {formatCurrency(c.creatorBudget, c.currency)}</p>
          <a href={`/campaigns/${c.id}`}>
            <Button size="sm" className="mt-4">View campaign</Button>
          </a>
        </Card>
      ))}
    </div>
  );
}

function AcceptanceGrid({ acceptances }: { acceptances: CampaignAcceptance[] | null }) {
  if (acceptances === null) return <Card><EmptyState title="Loading…" /></Card>;
  if (acceptances.length === 0) {
    return <Card><EmptyState title="Nothing here yet" /></Card>;
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Campaign</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Accepted</TableHeaderCell>
          <TableHeaderCell>Reels</TableHeaderCell>
        </TableRow>
      </TableHead>
      <tbody>
        {acceptances.map((a) => (
          <TableRow key={a.id}>
            <TableCell>
              <a href={`/campaigns/${a.campaignId}`} className="font-medium text-brand-600 hover:underline">
                {a.campaign.name}
              </a>
            </TableCell>
            <TableCell><CampaignStatusBadge status={a.status} /></TableCell>
            <TableCell>{new Date(a.acceptedAt).toLocaleDateString()}</TableCell>
            <TableCell>{a.reels.length}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
