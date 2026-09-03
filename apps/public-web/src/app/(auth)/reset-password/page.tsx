"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Card } from "@clip/ui";
import { apiFetch } from "../../../lib/api-client";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/v1/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword: password }) });
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <h1 className="text-2xl font-semibold text-ink">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose something you haven&apos;t used before.</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">New password</span>
          <input
            type="password"
            required
            autoFocus
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        {error ? <p className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p> : null}
        <Button type="submit" loading={busy} size="lg" className="w-full">
          Reset password
        </Button>
      </form>
    </Card>
  );
}

// /reset-password — see docs/users/AUTHENTICATION_FLOW.md "Password reset".
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
