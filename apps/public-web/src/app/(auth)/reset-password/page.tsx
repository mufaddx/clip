"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@clip/ui";
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
    <main className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <h1 className="text-2xl font-semibold text-ink">Set a new password</h1>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        {error ? <p className="text-sm text-danger-600">{error}</p> : null}
        <Button type="submit" loading={busy}>Reset password</Button>
      </form>
    </main>
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
