"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Button, IconBell, IconUser, IconAlertTriangle } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

// /settings — see docs/ui-ux/PAGE_SPECIFICATIONS.md. Account-level fields
// live on /profile (real, editable — see that page); this page is for
// device/notification preferences and account actions, kept as clearly
// separated rows rather than one undifferentiated card.
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

      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Card>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <IconUser className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">Account</p>
              <p className="mt-1 text-sm text-slate-500">
                Your name, bio, and content categories live on your{" "}
                <Link href="/profile" className="text-brand-600 hover:underline">profile</Link>.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <IconBell className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">Notifications</p>
              <p className="mt-1 text-sm text-slate-500">
                Per-notification email/push controls land here in a later pass — for now every notification type is on.
              </p>
            </div>
          </div>
        </Card>

        <Card style={{ borderColor: "#FCA5A5" }}>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
              <IconAlertTriangle className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-danger-700">Log out</p>
              <p className="mt-1 text-sm text-slate-500">Ends your session on this device. You&apos;ll need to sign in again.</p>
              <Button variant="destructive" className="mt-3" onClick={logout} loading={busy}>Log out</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
