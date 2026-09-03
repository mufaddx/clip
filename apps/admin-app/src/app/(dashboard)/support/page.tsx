"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";

interface Ticket {
  id: string;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
  user: { email: string; role: string };
}

// /support — see docs/operations/SUPPORT_SYSTEM.md.
export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);

  useEffect(() => {
    apiFetchClient<Ticket[]>("/v1/support/all").then(setTickets).catch(() => setTickets([]));
  }, []);

  return (
    <div>
      <PageHeader title="Support Queue" />
      <Card>
        {tickets === null ? (
          <EmptyState title="Loading…" />
        ) : tickets.length === 0 ? (
          <EmptyState title="Nothing waiting" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Subject</TableHeaderCell>
                <TableHeaderCell>From</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>{t.user.email}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell><Badge variant={t.status === "OPEN" ? "warning" : "success"}>{t.status}</Badge></TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
