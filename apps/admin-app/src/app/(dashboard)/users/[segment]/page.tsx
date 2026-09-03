"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge, Button, Field, Select, Input, Modal } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { AdminUserRow } from "../../../../lib/types";

const SEGMENT_LABEL: Record<string, string> = {
  all: "All Users",
  brands: "Brands",
  clippers: "Clippers",
  "admin-team": "Admin Team",
  suspended: "Suspended",
};

const ADMIN_ROLES = ["ADMIN", "SUPPORT", "FINANCE_ADMIN"];

// /users/{all,brands,clippers,admin-team,suspended} — see docs/admin/ADMIN_PANEL.md "User Management".
export default function UsersSegmentPage() {
  const { segment } = useParams<{ segment: string }>();
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ADMIN_ROLES[0]);
  const [busy, setBusy] = useState(false);

  async function load() {
    apiFetchClient<AdminUserRow[]>(`/v1/admin/users?filter=${segment}`).then(setUsers).catch(() => setUsers([]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  async function suspend(id: string) {
    await apiFetchClient(`/v1/admin/users/${id}/suspend`, { method: "PATCH" });
    await load();
  }

  async function reinstate(id: string) {
    await apiFetchClient(`/v1/admin/users/${id}/reinstate`, { method: "PATCH" });
    await load();
  }

  async function inviteAdmin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchClient("/v1/admin/admin-team/invite", { method: "POST", body: JSON.stringify({ email, role }) });
      setInviteOpen(false);
      setEmail("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={SEGMENT_LABEL[segment] ?? segment}
        action={segment === "admin-team" ? <Button onClick={() => setInviteOpen(true)}>Invite Admin</Button> : undefined}
      />

      <Card>
        {users === null ? (
          <EmptyState title="Loading…" />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell><Badge variant={u.status === "SUSPENDED" ? "danger" : "success"}>{u.status}</Badge></TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    {u.status === "SUSPENDED" ? (
                      <Button size="sm" onClick={() => reinstate(u.id)}>Reinstate</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => suspend(u.id)}>Suspend</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite admin team member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={inviteAdmin} loading={busy}>Send invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
