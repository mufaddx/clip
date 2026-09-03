"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatCard, Card, CardHeader, CardTitle, Table, TableHead, TableRow, TableHeaderCell, TableCell, EmptyState, Badge } from "@clip/ui";
import { formatCurrency, formatDateTime } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";
import type { Wallet, LedgerEntry } from "../../../lib/types";

// /wallet — see docs/ui-ux/PAGE_SPECIFICATIONS.md and docs/finance/WALLET_SYSTEM.md "Creator wallet buckets".
export default function ClipperWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null);

  useEffect(() => {
    apiFetchClient<Wallet>("/v1/wallet").then(setWallet).catch(() => setWallet(null));
    apiFetchClient<LedgerEntry[]>("/v1/wallet/ledger").then(setLedger).catch(() => setLedger([]));
  }, []);

  return (
    <div>
      <PageHeader title="Wallet" description="Your earnings buckets and transaction history." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Available" value={formatCurrency(wallet?.availableBalance ?? 0, wallet?.currency)} loading={!wallet} />
        <StatCard label="Pending" value={formatCurrency(wallet?.pendingBalance ?? 0, wallet?.currency)} loading={!wallet} />
        <StatCard label="Processing" value={formatCurrency(wallet?.processingBalance ?? 0, wallet?.currency)} loading={!wallet} />
        <StatCard label="Withdrawn" value={formatCurrency(wallet?.withdrawnBalance ?? 0, wallet?.currency)} loading={!wallet} />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Transaction history</CardTitle></CardHeader>
        {ledger === null ? (
          <EmptyState title="Loading…" />
        ) : ledger.length === 0 ? (
          <EmptyState title="No transactions yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Bucket</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell className="text-right">Amount</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {ledger.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{formatDateTime(e.createdAt)}</TableCell>
                  <TableCell><Badge variant={e.type === "CREDIT" ? "success" : "neutral"}>{e.type}</Badge></TableCell>
                  <TableCell>{e.bucket}</TableCell>
                  <TableCell>{e.source}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(e.amount)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
