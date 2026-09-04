"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@clip/ui";
import { apiFetch } from "../../../lib/api-client";
import { AuthCard, authInputClass, authLabelClass } from "../../../components/auth-card";

// /forgot-password — see docs/users/AUTHENTICATION_FLOW.md "Password
// reset". Two steps in one page: request a code, then enter that code
// + a new password (replaces the old emailed reset-link flow — see
// AuthService.requestPasswordReset/resetPassword).
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/v1/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setStep("reset"); // always proceeds — never reveals whether the email exists
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch("/v1/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) });
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "reset") {
    return (
      <AuthCard className="max-w-sm">
        <h1 className="text-xl font-semibold text-white">Enter your code</h1>
        <p className="mt-1 text-sm text-slate-400">We sent a 6-digit code to {email}, if an account exists for it.</p>

        <form onSubmit={submitReset} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className={authLabelClass}>Verification code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${authInputClass} text-center text-lg tracking-[0.3em]`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className={authLabelClass}>New password</span>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={authInputClass}
            />
          </label>

          {error ? <p className="rounded-md bg-danger-600/10 px-3 py-2 text-sm text-danger-600">{error}</p> : null}

          <Button type="submit" loading={busy} size="lg" className="w-full" disabled={code.length !== 6}>
            Reset password
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard className="max-w-sm">
      <h1 className="text-xl font-semibold text-white">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-400">We&apos;ll email you a code to get back in.</p>

      <form onSubmit={requestCode} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className={authLabelClass}>Email</span>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={authInputClass}
          />
        </label>
        <Button type="submit" loading={busy} size="lg" className="w-full">
          Send code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-500 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}
