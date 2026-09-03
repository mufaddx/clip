import { PageHeader, Card, Table, TableHead, TableRow, TableHeaderCell, TableCell, EmptyState, Badge } from "@clip/ui";
import { formatCurrency, formatDateTime } from "@clip/utilities";
import { apiFetch } from "../../../../lib/api-client.server";
import type { LedgerEntry } from "../../../../lib/types";

// /wallet/transactions — see docs/finance/LEDGER_ARCHITECTURE.md.
export default async function TransactionsPage() {
  const ledger = await apiFetch<LedgerEntry[]>("/v1/wallet/ledger").catch(() => []);

  return (
    <div>
      <PageHeader title="Transactions" />
      <Card>
        {ledger.length === 0 ? (
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
