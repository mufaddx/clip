"use client";

import { useState } from "react";
import { Button, Card, Field, Input, Textarea } from "@clip/ui";
import { apiFetchClient } from "../../lib/api-client";

const STEPS = ["Basic Profile", "Content Categories", "Creator Preferences", "Instagram Connection", "Review"];
const STEP_DESCRIPTIONS = [
  "This is what brands see when reviewing your campaign applications.",
  "You can refine your content categories any time from Profile.",
  "Campaign type preferences refine your Recommended tab over time.",
  "Required before you can accept a campaign — connect now or later.",
  "Double-check everything, then head to your dashboard.",
];

/**
 * Clipper onboarding — see docs/users/ONBOARDING_FLOW.md "Clipper
 * onboarding steps". Skipping Instagram connection here is allowed (per
 * the doc); the campaign accept action enforces it server-side instead.
 */
export default function ClipperOnboardingPage() {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectInstagram() {
    try {
      const { url } = await apiFetchClient<{ url: string }>("/v1/instagram/oauth/start");
      window.location.href = url;
    } catch {
      setError("Instagram isn't configured on this deployment yet — you can connect later from My Instagram.");
    }
  }

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/clippers/me", { method: "PATCH", body: JSON.stringify({ displayName, bio }) });
      await apiFetchClient("/v1/users/me/onboarding-status", { method: "PATCH", body: JSON.stringify({ step: "review", complete: true }) });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete onboarding.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12 sm:py-20">
      <img src="/logo-wordmark.png" alt="Vidlix" className="h-6 w-auto" />

      <Card className="mt-10 w-full max-w-md shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-ink">Let&apos;s set up your creator profile</h1>
        <p className="mt-1 text-sm text-slate-500">{STEP_DESCRIPTIONS[step]}</p>

        <div className="mt-6 flex flex-col gap-4">
          {step === 0 && (
            <>
              <Field label="Display name">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required />
              </Field>
              <Field label="Bio">
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short line about the content you create" />
              </Field>
            </>
          )}

          {step === 1 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Categories help match you to relevant campaigns. You&apos;ll set these up from your Profile page whenever you like.
            </div>
          )}

          {step === 2 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              We&apos;ll learn what campaign types work best for you as you accept and complete more of them.
            </div>
          )}

          {step === 3 && (
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{instagramConnected ? "Connected" : "Not connected yet"}</p>
                <p className="text-xs text-slate-500">You&apos;ll need this before accepting a campaign.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInstagramConnected(true);
                  connectInstagram();
                }}
              >
                Connect
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Display name</span>
                <span className="font-medium text-ink">{displayName || "—"}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Bio</span>
                <span className="max-w-[220px] truncate font-medium text-ink">{bio || "—"}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Instagram</span>
                <span className="font-medium text-ink">{instagramConnected ? "Connected" : "Not connected"}</span>
              </div>
            </div>
          )}
        </div>

        {error ? <p className="mt-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p> : null}

        <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !displayName}>
              Next
            </Button>
          ) : (
            <Button onClick={finish} loading={busy}>
              Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}
