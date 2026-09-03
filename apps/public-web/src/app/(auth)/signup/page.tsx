"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@clip/ui";
import type { LoginResponseDto, SignupRoleChoice } from "@clip/types";
import { apiFetch } from "../../../lib/api-client";
import { appUrlForRole } from "../../../lib/app-urls";

// /signup — first asks "How do you want to use CLIP?" per
// docs/users/ONBOARDING_FLOW.md. That choice is irreversible by the user
// afterward, so it's a deliberate separate step, not a form field.
function SignupForm() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("as");
  const [roleChoice, setRoleChoice] = useState<SignupRoleChoice | null>(
    preselect === "brand" ? "BRAND" : preselect === "clipper" ? "CLIPPER" : null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!roleChoice) {
    return (
      <main className="mx-auto flex max-w-sm flex-col px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">How do you want to use CLIP?</h1>
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" onClick={() => setRoleChoice("BRAND")}>
            I am a Brand
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setRoleChoice("CLIPPER")}>
            I am a Clipper
          </Button>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponseDto>("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, roleChoice }),
      });
      window.location.href = `${appUrlForRole(res.user.role)}${res.redirectTo}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <button onClick={() => setRoleChoice(null)} className="mb-4 text-left text-sm text-slate-500">
        ← Back
      </button>
      <h1 className="text-2xl font-semibold text-ink">
        Create your {roleChoice === "BRAND" ? "brand" : "clipper"} account
      </h1>

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
          Create account
        </Button>
      </form>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
