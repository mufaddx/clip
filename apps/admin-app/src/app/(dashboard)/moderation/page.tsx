"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Button } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";

interface ReelQueueItem {
  id: string;
  url: string;
  submittedAt: string;
  campaignCreator: { campaign: { name: string }; creator: { displayName: string } };
}

// /moderation — see docs/admin/MODERATION_SYSTEM.md.
export default function ModerationPage() {
  const [queue, setQueue] = useState<ReelQueueItem[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    apiFetchClient<ReelQueueItem[]>("/v1/moderation/queue").then(setQueue).catch(() => setQueue([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, approve: boolean) {
    setBusy(true);
    try {
      await apiFetchClient(`/v1/moderation/reels/${id}/decide`, { method: "POST", body: JSON.stringify({ approve }) });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Content Moderation" description="Reels stuck in manual review." />
      <Card>
        {queue === null ? (
          <EmptyState title="Loading…" />
        ) : queue.length === 0 ? (
          <EmptyState title="Nothing waiting for review" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Creator</TableHeaderCell>
                <TableHeaderCell>Campaign</TableHeaderCell>
                <TableHeaderCell>Reel</TableHeaderCell>
                <TableHeaderCell>Submitted</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {queue.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.campaignCreator.creator.displayName}</TableCell>
                  <TableCell>{r.campaignCreator.campaign.name}</TableCell>
                  <TableCell><a href={r.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">View</a></TableCell>
                  <TableCell>{formatDate(r.submittedAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" loading={busy} onClick={() => decide(r.id, true)}>Approve</Button>
                      <Button size="sm" variant="destructive" loading={busy} onClick={() => decide(r.id, false)}>Reject</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
