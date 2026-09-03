"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardHeader, CardTitle, Table, TableHead, TableRow, TableHeaderCell, TableCell, EmptyState, Badge, Button, Field, Input } from "@clip/ui";
import { formatCurrency, formatDateTime } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";
import type { Wallet } from "../../../lib/types";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payoutMethod: string | null;
  requestedAt: string;
  paidAt: string | null;
}

// /withdrawals — see docs/finance/WITHDRAWAL_SYSTEM.md.
export default function WithdrawalsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[] | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [w, list] = await Promise.all([
      apiFetchClient<Wallet>("/v1/wallet"),
      apiFetchClient<Withdrawal[]>("/v1/wallet/withdrawals"),
    ]);
    setWallet(w);
    setWithdrawals(list);
  }

  useEffect(() => {
    load();
  }, []);

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/wallet/withdrawals", {
        method: "POST",
        body: JSON.stringify({ amount: Math.round(Number(amount) * 100) }),
      });
      setAmount("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to request withdrawal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Withdrawals" description="Request a payout of your available balance." />

      <Card>
        <CardHeader><CardTitle>Available: {formatCurrency(wallet?.availableBalance ?? 0)}</CardTitle></CardHeader>
        <form onSubmit={requestWithdrawal} className="flex items-end gap-3">
          <Field label="Amount (₹)">
            <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-40" />
          </Field>
          <Button type="submit" loading={busy}>Request withdrawal</Button>
        </form>
        {error ? <p className="mt-2 text-sm text-danger-600">{error}</p> : null}
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        {withdrawals === null ? (
          <EmptyState title="Loading…" />
        ) : withdrawals.length === 0 ? (
          <EmptyState title="No withdrawals yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Requested</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{formatDateTime(w.requestedAt)}</TableCell>
                  <TableCell>{formatCurrency(w.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={w.status === "PAID" ? "success" : w.status === "FAILED" ? "danger" : "warning"}>{w.status}</Badge>
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
