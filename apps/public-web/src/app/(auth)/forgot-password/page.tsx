"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@clip/ui";
import { apiFetch } from "../../../lib/api-client";
import { IconCheckCircle } from "../../../components/icons";

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
    <Card className="w-full max-w-sm shadow-md">
      <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">We&apos;ll email you a link to get back in.</p>

      {sent ? (
        <div className="mt-6 flex items-start gap-3 rounded-md bg-success-50 p-4">
          <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
          <p className="text-sm text-success-700">
            If an account exists for that email, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <Button type="submit" loading={busy} size="lg" className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
