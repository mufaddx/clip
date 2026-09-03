"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@clip/ui";
import { apiFetch } from "../../../lib/api-client";
import { AuthCard, authInputClass, authLabelClass } from "../../../components/auth-card";

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
    <AuthCard className="max-w-sm">
      <h1 className="text-xl font-semibold text-white">Set a new password</h1>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className={authLabelClass}>New password</span>
          <input
            type="password"
            required
            autoFocus
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={authInputClass}
          />
        </label>
        {error ? <p className="rounded-md bg-danger-600/10 px-3 py-2 text-sm text-danger-600">{error}</p> : null}
        <Button type="submit" loading={busy} size="lg" className="w-full">
          Reset password
        </Button>
      </form>
    </AuthCard>
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
