"use client";

import { useState } from "react";
import { PageHeader, Card, Button } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

export default function SettingsPage() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await apiFetchClient("/v1/auth/logout", { method: "POST" });
    window.location.href = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "http://localhost:3000";
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <Card className="max-w-md">
        <p className="mb-4 text-sm text-slate-500">Notification preferences and billing settings expand here in a later pass.</p>
        <Button variant="destructive" onClick={logout} loading={busy}>Log out</Button>
      </Card>
    </div>
  );
}
