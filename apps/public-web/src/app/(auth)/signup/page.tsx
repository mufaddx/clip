"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@clip/ui";
import type { LoginResponseDto, RegisterResponseDto, SignupRoleChoice } from "@clip/types";
import { apiFetch, ApiError } from "../../../lib/api-client";
import { appUrlForRole } from "../../../lib/app-urls";
import { AuthCard, authInputClass, authLabelClass } from "../../../components/auth-card";
import { IconMegaphone, IconInstagram, IconArrowRight } from "../../../components/icons";

// /signup — reached from the homepage's Brand/Clipper picker (role arrives
// preselected via ?as=). Four steps, only three of which most people see:
// role (skipped when preselected) → credentials → email OTP → full name.
// See docs/users/AUTHENTICATION_FLOW.md "Email verification".
//
// The credentials step handles both new and returning users with one
// form: it tries to register the email, and if the backend says that
// email is already taken (EMAIL_IN_USE), it tries logging in with the
// same credentials instead. If that login says EMAIL_NOT_VERIFIED (a
// signup that was abandoned mid-OTP), it re-sends the code and drops
// them right back into the OTP step rather than a dead-end error.
type Step = "role" | "credentials" | "otp" | "name";

function RoleOption({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-white/25 hover:bg-white/10"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
        {icon}
      </span>
      <span className="font-semibold text-white">{title}</span>
      <IconArrowRight className="ml-auto h-4 w-4 text-slate-500" />
    </button>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("as");

  const [roleChoice, setRoleChoice] = useState<SignupRoleChoice | null>(
    preselect === "brand" ? "BRAND" : preselect === "clipper" ? "CLIPPER" : null
  );
  const [step, setStep] = useState<Step>(roleChoice ? "credentials" : "role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set once verifyEmail() succeeds — needed for the final "complete
  // profile" step's redirect and to know which endpoint saves the name.
  const [verifiedUser, setVerifiedUser] = useState<LoginResponseDto | null>(null);

  function pickRole(choice: SignupRoleChoice) {
    setRoleChoice(choice);
    setStep("credentials");
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleChoice) return;
    setError(null);
    setLoading(true);
    try {
      try {
        await apiFetch<RegisterResponseDto>("/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, roleChoice }),
        });
        setStep("otp");
      } catch (err) {
        if (!(err instanceof ApiError) || err.code !== "EMAIL_IN_USE") throw err;

        // Returning user — log in instead of registering.
        try {
          const res = await apiFetch<LoginResponseDto>("/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          window.location.href = `${appUrlForRole(res.user.role)}${res.redirectTo}`;
        } catch (loginErr) {
          if (loginErr instanceof ApiError && loginErr.code === "EMAIL_NOT_VERIFIED") {
            // They registered before but never finished OTP — pick that back up.
            await apiFetch("/v1/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) });
            setStep("otp");
          } else {
            throw loginErr;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponseDto>("/v1/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      setVerifiedUser(res);
      setStep("name");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setNotice(null);
    try {
      await apiFetch("/v1/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) });
      setNotice("A new code is on its way.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code.");
    }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verifiedUser) return;
    setError(null);
    setLoading(true);
    try {
      const path = roleChoice === "BRAND" ? "/v1/brands/me" : "/v1/clippers/me";
      const body = roleChoice === "BRAND" ? { companyName: fullName } : { displayName: fullName };
      await apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
      window.location.href = `${appUrlForRole(verifiedUser.user.role)}${verifiedUser.redirectTo}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "role" || !roleChoice) {
    return (
      <AuthCard className="max-w-sm">
        <h1 className="text-xl font-semibold text-white">Continue as</h1>
        <div className="mt-5 flex flex-col gap-3">
          <RoleOption icon={<IconMegaphone className="h-5 w-5" />} title="Brand" onClick={() => pickRole("BRAND")} />
          <RoleOption icon={<IconInstagram className="h-5 w-5" />} title="Clipper" onClick={() => pickRole("CLIPPER")} />
        </div>
      </AuthCard>
    );
  }

  if (step === "otp") {
    return (
      <AuthCard className="max-w-sm">
        <h1 className="text-xl font-semibold text-white">Check your email</h1>
        <p className="mt-1 text-sm text-slate-400">Enter the 6-digit code we sent to {email}.</p>

        <form onSubmit={handleOtpSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className={authLabelClass}>Verification code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${authInputClass} text-center text-lg tracking-[0.3em]`}
            />
          </label>

          {error ? <p className="rounded-md bg-danger-600/10 px-3 py-2 text-sm text-danger-600">{error}</p> : null}
          {notice ? <p className="rounded-md bg-success-600/10 px-3 py-2 text-sm text-success-600">{notice}</p> : null}

          <Button type="submit" loading={loading} size="lg" className="mt-1 w-full" disabled={code.length !== 6}>
            Verify
          </Button>

          <button type="button" onClick={handleResendCode} className="text-center text-xs text-slate-500 hover:text-slate-300">
            Didn&apos;t get it? <span className="underline">Resend code</span>
          </button>
        </form>
      </AuthCard>
    );
  }

  if (step === "name") {
    return (
      <AuthCard className="max-w-sm">
        <h1 className="text-xl font-semibold text-white">One last thing</h1>
        <p className="mt-1 text-sm text-slate-400">
          {roleChoice === "BRAND" ? "What's your name or your brand's name?" : "What's your name?"}
        </p>

        <form onSubmit={handleNameSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className={authLabelClass}>Full name</span>
            <input
              required
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className={authInputClass}
            />
          </label>

          {error ? <p className="rounded-md bg-danger-600/10 px-3 py-2 text-sm text-danger-600">{error}</p> : null}

          <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
            Continue
          </Button>
        </form>
      </AuthCard>
    );
  }

  // step === "credentials"
  return (
    <AuthCard className="max-w-sm">
      <button
        onClick={() => setStep("role")}
        className="mb-4 flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <IconArrowRight className="h-3.5 w-3.5 rotate-180" /> Back
      </button>
      <h1 className="text-xl font-semibold text-white">Continue as {roleChoice === "BRAND" ? "a Brand" : "a Clipper"}</h1>

      <form onSubmit={handleCredentialsSubmit} className="mt-6 flex flex-col gap-4">
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
            placeholder="At least 8 characters"
            className={authInputClass}
          />
        </label>

        {error ? (
          <p className="rounded-md bg-danger-600/10 px-3 py-2 text-sm text-danger-600">{error}</p>
        ) : null}

        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Continue
        </Button>

        <p className="text-center text-xs text-slate-500">
          New account? By continuing you agree to Vidlix&apos;s{" "}
          <a href="/terms" className="underline hover:text-slate-300">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-slate-300">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
