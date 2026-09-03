import { PageHeader, Card, Table, TableHead, TableRow, TableHeaderCell, TableCell, EmptyState } from "@clip/ui";
import { formatCurrency, formatDateTime } from "@clip/utilities";
import { apiFetch } from "../../../../lib/api-client";
import type { LedgerEntry } from "../../../../lib/types";

// /billing/refunds — see docs/finance/REFUND_SYSTEM.md.
export default async function RefundsPage() {
  const ledger = await apiFetch<LedgerEntry[]>("/v1/wallet/ledger").catch(() => []);
  const refunds = ledger.filter((e) => e.source === "REFUND");

  return (
    <div>
      <PageHeader title="Refunds" />
      <Card>
        {refunds.length === 0 ? (
          <EmptyState title="No refunds yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Bucket</TableHeaderCell>
                <TableHeaderCell className="text-right">Amount</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDateTime(r.createdAt)}</TableCell>
                  <TableCell>{r.bucket}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(r.amount)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
