"use client";

import { useState } from "react";
import { Button } from "@clip/ui";
import { apiFetch } from "../../../lib/api-client";

// /forgot-password — see docs/users/AUTHENTICATION_FLOW.md "Password reset".
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/v1/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setSent(true); // always shown — never reveals whether the email exists
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>

      {sent ? (
        <p className="mt-4 text-sm text-slate-600">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <Button type="submit" loading={busy}>Send reset link</Button>
        </form>
      )}
    </main>
  );
}
