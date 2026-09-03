"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge, Button } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { ClipperRow } from "../../../../lib/types";

const SEGMENT_FILTER: Record<string, "all" | "risk-review" | "verification"> = {
  all: "all",
  verification: "verification",
  performance: "all",
  "risk-review": "risk-review",
};

// /clippers/{all,verification,performance,risk-review} — see docs/admin/ADMIN_PANEL.md "Creator Management".
export default function ClippersSegmentPage() {
  const { segment } = useParams<{ segment: string }>();
  const [clippers, setClippers] = useState<ClipperRow[] | null>(null);

  async function load() {
    const filter = SEGMENT_FILTER[segment] ?? "all";
    apiFetchClient<ClipperRow[]>(`/v1/admin/clippers?filter=${filter}`).then(setClippers).catch(() => setClippers([]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  async function toggleFlag(id: string, flagged: boolean) {
    await apiFetchClient(`/v1/admin/clippers/${id}/risk-flag`, { method: "PATCH", body: JSON.stringify({ flagged }) });
    await load();
  }

  return (
    <div>
      <PageHeader title={`Clippers — ${segment.replace("-", " ")}`} />
      <Card>
        {clippers === null ? (
          <EmptyState title="Loading…" />
        ) : clippers.length === 0 ? (
          <EmptyState title="Nothing here" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Creator</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Trust Score</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
                <TableHeaderCell>Risk</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {clippers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.displayName}</TableCell>
                  <TableCell>{c.user.email}</TableCell>
                  <TableCell>{c.trustScore.toFixed(1)}</TableCell>
                  <TableCell>{formatDate(c.user.createdAt)}</TableCell>
                  <TableCell>{c.riskFlagged ? <Badge variant="danger">Flagged</Badge> : <Badge variant="success">Clear</Badge>}</TableCell>
                  <TableCell>
                    {c.riskFlagged ? (
                      <Button size="sm" onClick={() => toggleFlag(c.id, false)}>Clear</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => toggleFlag(c.id, true)}>Flag</Button>
                    )}
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
