"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clip/ui";
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
    <main className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <h1 className="text-2xl font-semibold text-ink">Log in to CLIP</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Password</span>
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

        <Button type="submit" loading={loading} className="mt-2">
          Log in
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-slate-500 hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-brand-600 hover:underline">
          Create an account
        </Link>
      </div>
    </main>
  );
}
