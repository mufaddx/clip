"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, EmptyState, Tabs, Button, Table, TableHead, TableRow, TableHeaderCell, TableCell, CampaignStatusBadge } from "@clip/ui";
import { formatCurrency, formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";
import type { Campaign } from "../../../lib/types";

const TABS = [
  { value: "ALL", label: "All Campaigns" },
  { value: "DRAFT", label: "Drafts" },
  { value: "PENDING_REVIEW", label: "Pending" },
  { value: "LIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
];

// /campaigns — see docs/ui-ux/PAGE_SPECIFICATIONS.md "Brand app".
export default function CampaignsPage() {
  const [tab, setTab] = useState("ALL");
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    const qs = tab === "ALL" ? "" : `?status=${tab}`;
    apiFetchClient<Campaign[]>(`/v1/campaigns${qs}`).then(setCampaigns).catch(() => setCampaigns([]));
  }, [tab]);

  return (
    <div>
      <PageHeader title="Campaigns" action={<Link href="/campaigns/create"><Button>Create Campaign</Button></Link>} />
      <Tabs items={TABS} value={tab} onChange={setTab} />

      <Card className="mt-4">
        {campaigns === null ? (
          <EmptyState title="Loading…" />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="Create your first campaign"
            description="Launch a campaign to reach Vidlix's creator network."
            action={<Link href="/campaigns/create"><Button variant="secondary">Create Campaign</Button></Link>}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Budget</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-brand-600 hover:underline">{c.name}</Link>
                  </TableCell>
                  <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                  <TableCell>{formatCurrency(c.creatorBudget)}</TableCell>
                  <TableCell>{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
