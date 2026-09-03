"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell } from "@clip/ui";
import { formatDateTime } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { AuditLogRow } from "../../../../lib/types";

// /security/{audit-logs,security-events} — see docs/admin/AUDIT_LOGS.md.
export default function SecuritySegmentPage() {
  const { segment } = useParams<{ segment: string }>();
  const [logs, setLogs] = useState<{ data: AuditLogRow[] } | null>(null);

  useEffect(() => {
    const path = segment === "security-events" ? "/v1/admin/security-events" : "/v1/admin/audit-logs";
    apiFetchClient<{ data: AuditLogRow[] }>(path).then(setLogs).catch(() => setLogs({ data: [] }));
  }, [segment]);

  return (
    <div>
      <PageHeader title={segment === "security-events" ? "Security Events" : "Audit Logs"} />
      <Card>
        {logs === null ? (
          <EmptyState title="Loading…" />
        ) : logs.data.length === 0 ? (
          <EmptyState title="Nothing recorded yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Actor Role</TableHeaderCell>
                <TableHeaderCell>Target</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {logs.data.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.action}</TableCell>
                  <TableCell>{l.actorRole}</TableCell>
                  <TableCell className="text-xs text-slate-400">{l.targetType}/{l.targetId.slice(0, 8)}</TableCell>
                  <TableCell>{formatDateTime(l.createdAt)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
