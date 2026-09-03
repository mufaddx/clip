"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge, Button, Modal, Field, Textarea } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";

interface Dispute {
  id: string;
  type: string;
  status: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  openedBy: { email: string };
}

// /disputes — see docs/operations/DISPUTE_SYSTEM.md.
export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[] | null>(null);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    apiFetchClient<Dispute[]>("/v1/disputes/all").then(setDisputes).catch(() => setDisputes([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(upheld: boolean) {
    if (!resolveId) return;
    setBusy(true);
    try {
      await apiFetchClient(`/v1/disputes/${resolveId}/resolve`, { method: "POST", body: JSON.stringify({ upheld, resolution }) });
      setResolveId(null);
      setResolution("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Disputes" />
      <Card>
        {disputes === null ? (
          <EmptyState title="Loading…" />
        ) : disputes.length === 0 ? (
          <EmptyState title="No disputes" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Opened by</TableHeaderCell>
                <TableHeaderCell>Target</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {disputes.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>{d.openedBy.email}</TableCell>
                  <TableCell className="text-xs text-slate-400">{d.targetType}/{d.targetId.slice(0, 8)}</TableCell>
                  <TableCell><Badge variant={d.status === "RESOLVED" || d.status === "CLOSED" ? "success" : "warning"}>{d.status}</Badge></TableCell>
                  <TableCell>{formatDate(d.createdAt)}</TableCell>
                  <TableCell>
                    {!["RESOLVED", "CLOSED"].includes(d.status) ? (
                      <Button size="sm" onClick={() => setResolveId(d.id)}>Resolve</Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!resolveId}
        onClose={() => setResolveId(null)}
        title="Resolve dispute"
        footer={
          <>
            <Button variant="secondary" loading={busy} onClick={() => resolve(false)}>Reject claim</Button>
            <Button loading={busy} onClick={() => resolve(true)}>Uphold claim</Button>
          </>
        }
      >
        <Field label="Resolution notes" helperText="A financial reversal (if the claim is upheld) requires editing reversal fields via the API directly for now.">
          <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} required />
        </Field>
      </Modal>
    </div>
  );
}
