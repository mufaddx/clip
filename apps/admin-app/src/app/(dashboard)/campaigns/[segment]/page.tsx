"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, CampaignStatusBadge, Button, Modal, Field, Textarea } from "@clip/ui";
import { formatCurrency, formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { Campaign } from "../../../../lib/types";

const SEGMENT_STATUS: Record<string, string | undefined> = {
  all: undefined,
  "pending-approval": "PENDING_REVIEW",
  active: "LIVE",
  paused: "PAUSED",
  completed: "COMPLETED",
  rejected: "REJECTED",
};

// /campaigns/{all,pending-approval,active,paused,completed,rejected} — see docs/admin/ADMIN_PANEL.md.
export default function AdminCampaignsSegmentPage() {
  const { segment } = useParams<{ segment: string }>();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  const status = SEGMENT_STATUS[segment];

  async function load() {
    const qs = status ? `?status=${status}` : "";
    apiFetchClient<Campaign[]>(`/v1/admin/campaigns${qs}`).then(setCampaigns).catch(() => setCampaigns([]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  async function approve(id: string) {
    setBusy(true);
    try {
      await apiFetchClient(`/v1/campaigns/${id}/approve`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!rejectId) return;
    setBusy(true);
    try {
      await apiFetchClient(`/v1/campaigns/${rejectId}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
      setRejectId(null);
      setReason("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title={`Campaigns — ${segment.replace("-", " ")}`} />
      <Card>
        {campaigns === null ? (
          <EmptyState title="Loading…" />
        ) : campaigns.length === 0 ? (
          <EmptyState title="No campaigns in this queue" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Budget</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                  <TableCell>{formatCurrency(c.creatorBudget)}</TableCell>
                  <TableCell>{formatDate(c.createdAt)}</TableCell>
                  <TableCell>
                    {c.status === "PENDING_REVIEW" ? (
                      <div className="flex gap-2">
                        <Button size="sm" loading={busy} onClick={() => approve(c.id)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectId(c.id)}>Reject</Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject campaign"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={reject} loading={busy}>Reject</Button>
          </>
        }
      >
        <Field label="Reason (shown to the brand)">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
        </Field>
      </Modal>
    </div>
  );
}
