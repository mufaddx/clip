"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge } from "@clip/ui";
import { formatDateTime } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { InstagramAccountRow } from "../../../../lib/types";

const SEGMENT_HEALTH: Record<string, string | undefined> = {
  "connected-accounts": undefined,
  "connection-health": undefined,
  errors: "ERROR",
};

// /instagram/{connected-accounts,connection-health,errors} — see docs/admin/ADMIN_PANEL.md.
export default function InstagramSegmentPage() {
  const { segment } = useParams<{ segment: string }>();
  const [accounts, setAccounts] = useState<InstagramAccountRow[] | null>(null);

  useEffect(() => {
    const health = SEGMENT_HEALTH[segment];
    apiFetchClient<InstagramAccountRow[]>(`/v1/admin/instagram-accounts${health ? `?health=${health}` : ""}`)
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, [segment]);

  return (
    <div>
      <PageHeader title={`Instagram — ${segment.replace("-", " ")}`} />
      <Card>
        {accounts === null ? (
          <EmptyState title="Loading…" />
        ) : accounts.length === 0 ? (
          <EmptyState title="Nothing here" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Creator</TableHeaderCell>
                <TableHeaderCell>Username</TableHeaderCell>
                <TableHeaderCell>Health</TableHeaderCell>
                <TableHeaderCell>Last Synced</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.creator.displayName}</TableCell>
                  <TableCell>@{a.username}</TableCell>
                  <TableCell><Badge variant={a.connectionHealth === "HEALTHY" ? "success" : "danger"}>{a.connectionHealth}</Badge></TableCell>
                  <TableCell>{a.lastSyncedAt ? formatDateTime(a.lastSyncedAt) : "—"}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
