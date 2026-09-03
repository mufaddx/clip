"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card } from "@clip/ui";
import type { LoginResponseDto, SignupRoleChoice } from "@clip/types";
import { apiFetch } from "../../../lib/api-client";
import { appUrlForRole } from "../../../lib/app-urls";
import { IconMegaphone, IconInstagram, IconArrowRight } from "../../../components/icons";

// /signup — first asks "How do you want to use CLIP?" per
// docs/users/ONBOARDING_FLOW.md. That choice is irreversible by the user
// afterward, so it's a deliberate separate step, not a form field.
function RoleOption({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
        active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-slate-500">{description}</span>
      </span>
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
      <Card className="w-full max-w-md shadow-md">
        <h1 className="text-2xl font-semibold text-ink">How do you want to use CLIP?</h1>
        <p className="mt-1 text-sm text-slate-500">You can&apos;t switch this later, so pick the one that fits.</p>

        <div className="mt-6 flex flex-col gap-3">
          <RoleOption
            active={false}
            icon={<IconMegaphone className="h-5 w-5" />}
            title="I am a Brand"
            description="I want to fund a campaign and get content distributed by creators."
            onClick={() => setRoleChoice("BRAND")}
          />
          <RoleOption
            active={false}
            icon={<IconInstagram className="h-5 w-5" />}
            title="I am a Clipper"
            description="I create content and want to get paid for verified performance."
            onClick={() => setRoleChoice("CLIPPER")}
          />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </a>
        </p>
      </Card>
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
    <Card className="w-full max-w-sm shadow-md">
      <button
        onClick={() => setRoleChoice(null)}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-ink"
      >
        <IconArrowRight className="h-3.5 w-3.5 rotate-180" /> Back
      </button>
      <h1 className="text-2xl font-semibold text-ink">
        Create your {roleChoice === "BRAND" ? "brand" : "clipper"} account
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {roleChoice === "BRAND"
          ? "Set up your first campaign in minutes."
          : "Start discovering campaigns that fit your audience."}
      </p>

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
          Create account
        </Button>

        <p className="text-center text-xs text-slate-400">
          By continuing you agree to CLIP&apos;s{" "}
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
