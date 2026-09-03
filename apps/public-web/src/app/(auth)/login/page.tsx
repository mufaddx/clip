"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clip/ui";
import type { LoginResponseDto } from "@clip/types";
import { apiFetch } from "../../../lib/api-client";
import { appUrlForRole } from "../../../lib/app-urls";
import { AuthCard, authInputClass, authLabelClass } from "../../../components/auth-card";

// /login — see docs/users/AUTHENTICATION_FLOW.md "Login flow" and
// docs/ui-ux/PAGE_SPECIFICATIONS.md. Most users never see this page — the
// homepage's Brand/Clipper picker (/signup?as=) handles login-or-signup in
// one form — but it stays reachable directly for anyone who wants it.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponseDto>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // Role validation already happened server-side; this is just where
      // the browser goes next — see docs/users/AUTHENTICATION_FLOW.md.
      window.location.href = `${appUrlForRole(res.user.role)}${res.redirectTo}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard className="max-w-sm">
      <h1 className="text-xl font-semibold text-white">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

        <label className="flex flex-col gap-1 text-sm">
          <span className={authLabelClass}>Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={authInputClass}
          />
        </label>

        {error ? (
          <p className="rounded-md bg-danger-600/10 px-3 py-2 text-sm text-danger-600">{error}</p>
        ) : null}

        <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
          Log in
        </Button>
      </form>

      <div className="mt-5 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-slate-500 hover:text-white hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="font-medium text-brand-500 hover:underline">
          Create an account
        </Link>
      </div>
    </AuthCard>
  );
}
