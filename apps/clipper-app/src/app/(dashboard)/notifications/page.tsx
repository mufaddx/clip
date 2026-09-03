"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Button } from "@clip/ui";
import { formatRelative } from "@clip/utilities";
import { apiFetchClient } from "../../../lib/api-client";

interface Notification {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

// /notifications — see docs/operations/NOTIFICATION_SYSTEM.md.
export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[] | null>(null);

  useEffect(() => {
    apiFetchClient<Notification[]>("/v1/notifications").then(setItems).catch(() => setItems([]));
  }, []);

  async function markAllRead() {
    await apiFetchClient("/v1/notifications/read-all", { method: "POST" });
    setItems((prev) => prev?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ?? null);
  }

  return (
    <div>
      <PageHeader title="Notifications" action={<Button variant="secondary" onClick={markAllRead}>Mark all read</Button>} />
      <Card>
        {items === null ? (
          <EmptyState title="Loading…" />
        ) : items.length === 0 ? (
          <EmptyState title="You're all caught up" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className={`py-3 ${n.readAt ? "" : "bg-brand-50/50"}`}>
                <p className="font-medium text-ink">{n.title}</p>
                <p className="text-sm text-slate-500">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{formatRelative(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
