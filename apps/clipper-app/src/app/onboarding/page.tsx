"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea } from "@clip/ui";
import { apiFetchClient } from "../../lib/api-client";

const STEPS = ["Basic Profile", "Content Categories", "Creator Preferences", "Instagram Connection", "Review"];

/**
 * Clipper onboarding — see docs/users/ONBOARDING_FLOW.md "Clipper
 * onboarding steps". Skipping Instagram connection here is allowed (per
 * the doc); the campaign accept action enforces it server-side instead.
 */
export default function ClipperOnboardingPage() {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
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
    <main className="mx-auto flex max-w-md flex-col px-6 py-24">
      <p className="mb-2 text-xs font-medium text-slate-400">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      <h1 className="text-2xl font-semibold text-ink">Let&apos;s set up your creator profile</h1>

      <div className="mt-6 flex flex-col gap-3">
        {step === 0 && (
          <>
            <Field label="Display name"><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></Field>
            <Field label="Bio"><Textarea value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
          </>
        )}
        {step === 1 && <p className="text-sm text-slate-500">You can refine your content categories any time from Profile.</p>}
        {step === 2 && <p className="text-sm text-slate-500">Campaign type preferences refine your Recommended tab over time.</p>}
        {step === 3 && (
          <div>
            <p className="mb-2 text-sm text-slate-500">Required before you can accept a campaign — connect now or later.</p>
            <Button variant="secondary" onClick={connectInstagram}>Connect Instagram</Button>
          </div>
        )}
        {step === 4 && (
          <div className="text-sm text-slate-600">
            <p><strong>Name:</strong> {displayName || "—"}</p>
          </div>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-danger-600">{error}</p> : null}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : (
          <Button onClick={finish} loading={busy}>Go to Dashboard</Button>
        )}
      </div>
    </main>
  );
}
