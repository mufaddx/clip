"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, Input, Select } from "@clip/ui";
import { apiFetchClient } from "../../lib/api-client";

interface CategoryOption {
  id: string;
  name: string;
}

const STEPS = ["Account Details", "Organization Details", "Industry and Category", "Team Setup", "Review"];
const STEP_DESCRIPTIONS = [
  "Your account was created at signup — just a few more details.",
  "This is how creators and the platform team will identify your brand.",
  "Helps match your campaigns to the right creator categories.",
  "You can invite team members any time from Team Members in the sidebar.",
  "Double-check everything, then head to your dashboard.",
];
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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchClient<CategoryOption[]>("/v1/categories")
      .then(setCategories)
      .catch(() => setCategories([])); // non-fatal — the picker just shows empty if this fails
  }, []);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/brands/me", {
        method: "PATCH",
        body: JSON.stringify({ companyName, website, industry, categoryIds: selectedCategoryIds }),
      });
      await apiFetchClient("/v1/users/me/onboarding-status", { method: "PATCH", body: JSON.stringify({ step: "review", complete: true }) });
      // The access token issued at login still has onboardingComplete:false
      // baked in — updating the DB doesn't retroactively change an already-
      // issued JWT. Without this, the middleware reads the stale token and
      // bounces straight back to /onboarding. /v1/auth/refresh re-reads the
      // user from the DB and issues a fresh token with the new value.
      await apiFetchClient("/v1/auth/refresh", { method: "POST" });
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

        <h1 className="text-xl font-semibold text-ink">Let&apos;s set up your brand</h1>
        <p className="mt-1 text-sm text-slate-500">{STEP_DESCRIPTIONS[step]}</p>

        <div className="mt-6 flex flex-col gap-4">
          {step === 0 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Just three quick steps and you&apos;ll be ready to launch your first campaign.
            </div>
          )}
          {step === 1 && (
            <>
              <Field label="Company name">
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company" required />
              </Field>
              <Field label="Website">
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Industry">
                <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Content categories your campaigns fit into">
                <div className="flex flex-wrap gap-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-slate-400">Loading categories…</p>
                  ) : (
                    categories.map((c) => {
                      const active = selectedCategoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCategory(c.id)}
                          className={
                            active
                              ? "rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white"
                              : "rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300"
                          }
                        >
                          {c.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </Field>
            </>
          )}
          {step === 3 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              You can invite team members any time from Team Members in the sidebar.
            </div>
          )}
          {step === 4 && (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Company</span>
                <span className="font-medium text-ink">{companyName || "—"}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Website</span>
                <span className="max-w-[220px] truncate font-medium text-ink">{website || "—"}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Industry</span>
                <span className="font-medium text-ink">{industry}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">Categories</span>
                <span className="max-w-[220px] truncate font-medium text-ink">
                  {selectedCategoryIds.length > 0
                    ? categories
                        .filter((c) => selectedCategoryIds.includes(c.id))
                        .map((c) => c.name)
                        .join(", ")
                    : "—"}
                </span>
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
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !companyName}>
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
