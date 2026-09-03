import { PageHeader, Card, Table, TableHead, TableRow, TableHeaderCell, TableCell, EmptyState } from "@clip/ui";
import { formatCurrency, formatDateTime } from "@clip/utilities";
import { apiFetch } from "../../../../lib/api-client.server";
import type { LedgerEntry } from "../../../../lib/types";

// /billing/payments — deposits only, from the wallet ledger. See docs/finance/PAYMENT_SYSTEM.md.
export default async function BillingPaymentsPage() {
  const ledger = await apiFetch<LedgerEntry[]>("/v1/wallet/ledger").catch(() => []);
  const deposits = ledger.filter((e) => e.source === "DEPOSIT");

  return (
    <div>
      <PageHeader title="Payments" />
      <Card>
        {deposits.length === 0 ? (
          <EmptyState title="No payments yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell className="text-right">Amount</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {deposits.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{formatDateTime(d.createdAt)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(d.amount)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
