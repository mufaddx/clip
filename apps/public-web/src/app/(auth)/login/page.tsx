"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card } from "@clip/ui";
import type { LoginResponseDto } from "@clip/types";
import { apiFetch } from "../../../lib/api-client";
import { appUrlForRole } from "../../../lib/app-urls";

// /login — see docs/users/AUTHENTICATION_FLOW.md "Login flow" and
// docs/ui-ux/PAGE_SPECIFICATIONS.md.
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
    <Card className="w-full max-w-sm shadow-md">
      <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to your CLIP account.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        {error ? (
          <p className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p>
        ) : null}

        <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
          Log in
        </Button>
      </form>

      <div className="mt-5 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-slate-500 hover:text-ink hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          Create an account
        </Link>
      </div>
    </Card>
  );
}
