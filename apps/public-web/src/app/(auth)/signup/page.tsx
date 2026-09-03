"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card } from "@clip/ui";
import type { LoginResponseDto, SignupRoleChoice } from "@clip/types";
import { apiFetch, ApiError } from "../../../lib/api-client";
import { appUrlForRole } from "../../../lib/app-urls";
import { IconMegaphone, IconInstagram, IconArrowRight } from "../../../components/icons";

// /signup — reached from the homepage's Brand/Clipper picker (role arrives
// preselected via ?as=), so the common path never shows a separate "how do
// you want to use CLIP" step. Visiting /signup directly (no query param)
// still shows that chooser as a fallback — see
// docs/users/ONBOARDING_FLOW.md.
//
// One form handles both new and returning users: it tries to register the
// email, and if the backend says that email is already taken
// (EMAIL_IN_USE), it quietly logs in with the same credentials instead —
// so the user never has to know or care which one it was.
function RoleOption({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </span>
      <span className="font-semibold text-ink">{title}</span>
      <IconArrowRight className="ml-auto h-4 w-4 text-slate-400" />
    </button>
  );
}

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
      <Card className="w-full max-w-sm shadow-md">
        <h1 className="text-xl font-semibold text-ink">Continue as</h1>
        <div className="mt-5 flex flex-col gap-3">
          <RoleOption icon={<IconMegaphone className="h-5 w-5" />} title="Brand" onClick={() => setRoleChoice("BRAND")} />
          <RoleOption icon={<IconInstagram className="h-5 w-5" />} title="Clipper" onClick={() => setRoleChoice("CLIPPER")} />
        </div>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res: LoginResponseDto;
      try {
        res = await apiFetch<LoginResponseDto>("/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, roleChoice }),
        });
      } catch (err) {
        // Already have an account with this email → this is a returning
        // user, not a failed signup. Log them in with the same credentials
        // instead of making them start over on a different form.
        if (err instanceof ApiError && err.code === "EMAIL_IN_USE") {
          res = await apiFetch<LoginResponseDto>("/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
        } else {
          throw err;
        }
      }
      window.location.href = `${appUrlForRole(res.user.role)}${res.redirectTo}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <button
        onClick={() => setRoleChoice(null)}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-ink"
      >
        <IconArrowRight className="h-3.5 w-3.5 rotate-180" /> Back
      </button>
      <h1 className="text-xl font-semibold text-ink">Continue as {roleChoice === "BRAND" ? "a Brand" : "a Clipper"}</h1>

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
            placeholder="At least 8 characters"
            className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        {error ? (
          <p className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p>
        ) : null}

        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Continue
        </Button>

        <p className="text-center text-xs text-slate-400">
          New account? By continuing you agree to CLIP&apos;s{" "}
          <a href="/terms" className="underline hover:text-slate-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
