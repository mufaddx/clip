"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge, Button, Field, Select, Input, Textarea, Modal } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";

interface Ticket {
  id: string;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
}

const CATEGORIES = ["CAMPAIGN", "PAYMENT", "INSTAGRAM", "VERIFICATION", "PERFORMANCE", "ACCOUNT", "OTHER"];

// /support — see docs/operations/SUPPORT_SYSTEM.md.
export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    apiFetchClient<Ticket[]>("/v1/support").then(setTickets).catch(() => setTickets([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchClient("/v1/support", { method: "POST", body: JSON.stringify({ category, subject, message }) });
      setOpen(false);
      setSubject("");
      setMessage("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Support" action={<Button onClick={() => setOpen(true)}>New ticket</Button>} />

      <Card>
        {tickets === null ? (
          <EmptyState title="Loading…" />
        ) : tickets.length === 0 ? (
          <EmptyState title="No tickets yet" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{t.subject}</p>
                  <p className="text-sm text-slate-500">{t.category} · {formatDate(t.createdAt)}</p>
                </div>
                <Badge variant={t.status === "RESOLVED" || t.status === "CLOSED" ? "success" : "warning"}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New support ticket" footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={createTicket} loading={busy}>Submit</Button>
        </>
      }>
        <div className="flex flex-col gap-3">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Subject">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </Field>
          <Field label="Message">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
