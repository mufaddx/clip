"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge, Button, Field, Input, Checkbox, Modal } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";
import type { TeamMember } from "../../../lib/types";

const PERMISSIONS = [
  "CAMPAIGNS_VIEW",
  "CAMPAIGNS_CREATE",
  "CAMPAIGNS_EDIT",
  "CAMPAIGNS_APPROVE_BUDGET",
  "ANALYTICS_VIEW",
  "REPORTS_VIEW",
  "WALLET_VIEW",
  "TEAM_INVITE",
];

// /team — see docs/users/TEAM_MEMBER_FLOW.md.
export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["CAMPAIGNS_VIEW"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    apiFetchClient<TeamMember[]>("/v1/brands/team").then(setMembers).catch(() => setMembers([]));
  }

  useEffect(() => {
    load();
  }, []);

  function togglePermission(p: string) {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/brands/team/invite", { method: "POST", body: JSON.stringify({ email, permissions }) });
      setOpen(false);
      setEmail("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to invite.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await apiFetchClient(`/v1/brands/team/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader title="Team Members" action={<Button onClick={() => setOpen(true)}>Invite Member</Button>} />

      <Card>
        {members === null ? (
          <EmptyState title="Loading…" />
        ) : members.length === 0 ? (
          <EmptyState title="No team members yet" description="Invite teammates to help manage campaigns." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Permissions</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.user.email}</TableCell>
                  <TableCell className="text-xs text-slate-500">{m.permissions.join(", ")}</TableCell>
                  <TableCell><Badge variant={m.acceptedAt ? "success" : "warning"}>{m.acceptedAt ? "Active" : "Pending"}</Badge></TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => remove(m.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite team member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={invite} loading={busy}>Send invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Permissions</p>
            <div className="flex flex-col gap-1">
              {PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox checked={permissions.includes(p)} onChange={() => togglePermission(p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-danger-600">{error}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
