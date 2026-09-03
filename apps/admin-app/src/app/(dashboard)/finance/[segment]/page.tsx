"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge, Button, Modal, Field, Textarea } from "@clip/ui";
import { formatCurrency, formatDateTime } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { WithdrawalRow } from "../../../../lib/types";

// /finance/{platform-wallet,payments,earnings,withdrawals,refunds,transactions} — see docs/admin/ADMIN_PANEL.md.
// Withdrawals is the fully wired queue; the other five need dedicated
// admin-wide listing endpoints not yet built (see docs/api/API_ENDPOINTS.md)
// — stubbed honestly rather than left silently broken.
export default function FinanceSegmentPage() {
  const { segment } = useParams<{ segment: string }>();

  if (segment === "withdrawals") return <WithdrawalsQueue />;

  return (
    <div>
      <PageHeader title={`Finance — ${segment.replace("-", " ")}`} />
      <Card>
        <EmptyState title="Not built yet" description="This admin-wide listing endpoint doesn't exist yet — see docs/api/API_ENDPOINTS.md." />
      </Card>
    </div>
  );
}

function WithdrawalsQueue() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[] | null>(null);
  const [failId, setFailId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    apiFetchClient<WithdrawalRow[]>("/v1/admin/withdrawals").then(setWithdrawals).catch(() => setWithdrawals([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function complete(id: string) {
    setBusy(true);
    try {
      await apiFetchClient(`/v1/admin/withdrawals/${id}/complete`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function fail() {
    if (!failId) return;
    setBusy(true);
    try {
      await apiFetchClient(`/v1/admin/withdrawals/${failId}/fail`, { method: "POST", body: JSON.stringify({ reason }) });
      setFailId(null);
      setReason("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Withdrawals" />
      <Card>
        {withdrawals === null ? (
          <EmptyState title="Loading…" />
        ) : withdrawals.length === 0 ? (
          <EmptyState title="No withdrawals" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Requested</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.wallet.user.email}</TableCell>
                  <TableCell>{formatCurrency(w.amount)}</TableCell>
                  <TableCell><Badge variant={w.status === "PAID" ? "success" : w.status === "FAILED" ? "danger" : "warning"}>{w.status}</Badge></TableCell>
                  <TableCell>{formatDateTime(w.requestedAt)}</TableCell>
                  <TableCell>
                    {["REQUESTED", "APPROVED", "PROCESSING"].includes(w.status) ? (
                      <div className="flex gap-2">
                        <Button size="sm" loading={busy} onClick={() => complete(w.id)}>Mark Paid</Button>
                        <Button size="sm" variant="destructive" onClick={() => setFailId(w.id)}>Mark Failed</Button>
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
        open={!!failId}
        onClose={() => setFailId(null)}
        title="Mark withdrawal failed"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFailId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={fail} loading={busy}>Confirm</Button>
          </>
        }
      >
        <Field label="Reason">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
        </Field>
      </Modal>
    </div>
  );
}
