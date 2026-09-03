"use client";

import { useState } from "react";
import { Button, Field, Input, Select } from "@clip/ui";
import { apiFetchClient } from "../../lib/api-client";

const STEPS = ["Account Details", "Organization Details", "Industry and Category", "Team Setup", "Review"];
const INDUSTRIES = ["Beauty", "Fashion", "Fitness", "Food", "Gaming", "Tech", "Travel", "Finance", "Comedy", "Lifestyle", "Other"];

/**
 * Brand onboarding — see docs/users/ONBOARDING_FLOW.md "Brand onboarding
 * steps". Team Setup (invites) is skippable here and can be done later
 * from /team, matching the doc's "skippable, can be done later" note.
 */
export default function BrandOnboardingPage() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/brands/me", { method: "PATCH", body: JSON.stringify({ companyName, website, industry }) });
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
      <h1 className="text-2xl font-semibold text-ink">Let&apos;s set up your brand</h1>

      <div className="mt-6 flex flex-col gap-3">
        {step === 0 && <p className="text-sm text-slate-500">Your account was created at signup — just a few more details.</p>}
        {step === 1 && (
          <>
            <Field label="Company name"><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required /></Field>
            <Field label="Website"><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" /></Field>
          </>
        )}
        {step === 2 && (
          <Field label="Industry">
            <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
          </Field>
        )}
        {step === 3 && <p className="text-sm text-slate-500">You can invite team members any time from Team Members in the sidebar.</p>}
        {step === 4 && (
          <div className="text-sm text-slate-600">
            <p><strong>Company:</strong> {companyName || "—"}</p>
            <p><strong>Industry:</strong> {industry}</p>
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
