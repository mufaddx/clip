"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Textarea, PageHeader, cn } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";

interface CategoryOption {
  id: string;
  name: string;
}

const STEPS = ["Basic Information", "Content", "Creator Requirements", "Performance Targets", "Budget", "Review"];

/**
 * Campaign creation — see docs/campaigns/CAMPAIGN_CREATION_FLOW.md. All six
 * steps are collected client-side and posted as one draft on Review; every
 * campaign here pays for VIEWS (the platform doesn't do reach/engagement/
 * distribution-style objectives), so there's no objective picker — the
 * backend defaults it. "Submit for Review" then calls /submit, matching
 * docs/campaigns/CAMPAIGN_LIFECYCLE.md.
 */
export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [requiredMentions, setRequiredMentions] = useState("");
  const [instructions, setInstructions] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [minTrustScore, setMinTrustScore] = useState("");
  // Doubles as the hard cap on acceptances AND the budget driver — see
  // "Budget" step below.
  const [accountsWanted, setAccountsWanted] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  // Minor units per clipper account/post — admin-set, see
  // /v1/campaigns/account-rate.
  const [ratePerAccount, setRatePerAccount] = useState<number | null>(null);
  // How many clippers actually match the current targeting right now — see
  // /v1/campaigns/eligible-count. Re-fetched whenever the category
  // selection changes so this is a live number, not a one-time load.
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);

  useEffect(() => {
    apiFetchClient<CategoryOption[]>("/v1/categories")
      .then(setCategories)
      .catch(() => setCategories([])); // non-fatal — the picker just shows empty if this fails
    apiFetchClient<{ ratePerAccount: number }>("/v1/campaigns/account-rate")
      .then((r) => setRatePerAccount(r.ratePerAccount))
      .catch(() => setRatePerAccount(null));
  }, []);

  useEffect(() => {
    const qs = selectedCategoryIds.length > 0 ? `?categoryIds=${selectedCategoryIds.join(",")}` : "";
    apiFetchClient<{ eligibleCount: number }>(`/v1/campaigns/eligible-count${qs}`)
      .then((r) => setEligibleCount(r.eligibleCount))
      .catch(() => setEligibleCount(null)); // non-fatal — the wizard still works without this number
  }, [selectedCategoryIds]);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  const accounts = Number(accountsWanted || 0);
  // ratePerAccount is in minor units (paise); everything shown to the
  // brand is in rupees.
  const ratePerAccountRupees = ratePerAccount != null ? ratePerAccount / 100 : null;
  const creatorBudgetRupees = ratePerAccountRupees != null ? accounts * ratePerAccountRupees : 0;
  const estimatedFee = Math.round(creatorBudgetRupees * 100 * 0.15); // 15% default, real rate locked at funding time
  const estimatedTotal = Math.round(creatorBudgetRupees * 100) + estimatedFee;

  // Direct browser-to-R2 upload (see docs/campaigns/CAMPAIGN_CREATION_FLOW.md
  // "Assets" and apps/api's UploadsService): the API only signs a short-lived
  // PUT URL — the file bytes never pass through this Next.js app or the API,
  // they go straight from the browser to the bucket. The uploaded file
  // itself lives in R2 indefinitely — nothing here expires or deletes it
  // unless the campaign's asset is explicitly removed.
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    setMediaUrl("");
    try {
      const presigned = await apiFetchClient<{ uploadUrl: string; publicUrl: string }>("/v1/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      const putRes = await fetch(presigned.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error("Upload failed — please try again.");

      setMediaUrl(presigned.publicUrl);
      setUploadedFileName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file if they retry
    }
  }

  async function submit(alsoSubmitForReview: boolean) {
    setBusy(true);
    setError(null);
    try {
      const created = await apiFetchClient<{ id: string }>("/v1/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || undefined,
          maxParticipants: accounts || undefined,
          durationDays: durationDays ? Number(durationDays) : undefined,
          requirements: {
            minFollowers: minFollowers ? Number(minFollowers) : undefined,
            minTrustScore: minTrustScore ? Number(minTrustScore) : undefined,
            categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
          },
          assets: mediaUrl
            ? [
                {
                  mediaUrl,
                  caption: caption || undefined,
                  hashtags: hashtags ? hashtags.split(",").map((h) => h.trim()) : [],
                  requiredMentions: requiredMentions ? requiredMentions.split(",").map((m) => m.trim()) : [],
                  instructions: instructions || undefined,
                },
              ]
            : undefined,
        }),
      });

      if (alsoSubmitForReview) {
        await apiFetchClient(`/v1/campaigns/${created.id}/submit`, { method: "POST" });
      }
      router.push(`/campaigns/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create campaign.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Create Campaign" />

      <div className="mx-auto mb-8 flex max-w-2xl items-start">
        {STEPS.map((s, i) => (
          <div key={s} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                      ? "border-2 border-brand-600 text-brand-700"
                      : "border border-slate-200 text-slate-400"
                )}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "max-w-[80px] text-center text-[11px] font-medium leading-tight",
                  i === step ? "text-brand-700" : "text-slate-400"
                )}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div className={cn("mx-2 mt-4 h-0.5 flex-1", i < step ? "bg-brand-600" : "bg-slate-200")} />
            ) : null}
          </div>
        ))}
      </div>

      <Card className="mx-auto max-w-2xl">
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <Field label="Campaign Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <Field
              label="Campaign creative (image or video)"
              helperText={
                uploading
                  ? "Uploading…"
                  : mediaUrl
                    ? `Uploaded: ${uploadedFileName}`
                    : "Required — this is what clippers will see and be asked to publish."
              }
              error={uploadError ?? undefined}
            >
              <Input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} />
            </Field>
            <Field label="Caption"><Textarea value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
            <Field label="Hashtags (comma-separated)"><Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} /></Field>
            <Field label="Required mentions (comma-separated)"><Input value={requiredMentions} onChange={(e) => setRequiredMentions(e.target.value)} /></Field>
            <Field label="Publishing instructions"><Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} /></Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <Field
              label="Content categories"
              helperText="Only clippers whose account matches one of these categories will see this campaign — leave empty to open it to everyone."
            >
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
            <p className="-mt-1 text-sm text-slate-500">
              {eligibleCount === null
                ? "Checking eligible clippers…"
                : `${eligibleCount.toLocaleString()} clipper${eligibleCount === 1 ? "" : "s"} currently match${eligibleCount === 1 ? "es" : ""} this targeting.`}
            </p>
            <Field label="Minimum followers"><Input type="number" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} /></Field>
            <Field label="Minimum trust score (0-100)"><Input type="number" value={minTrustScore} onChange={(e) => setMinTrustScore(e.target.value)} /></Field>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm text-slate-600">
              Performance target: <strong>Views</strong> — every campaign on Vidlix pays clippers to repost your
              content, and reels are tracked on the views/engagement they actually get.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-3">
            <Field
              label="Number of clipper accounts"
              helperText="How many clippers you want reposting this — this is also the maximum number who can accept."
            >
              <Input type="number" min="1" value={accountsWanted} onChange={(e) => setAccountsWanted(e.target.value)} required />
            </Field>
            <Field label="Campaign duration (days)" helperText="How long this campaign should stay open to new clippers.">
              <Input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            </Field>

            <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm">
              <p className="text-slate-600">
                Rate: <strong>{ratePerAccountRupees != null ? formatCurrency(Math.round(ratePerAccountRupees * 100)) : "…"}</strong> per
                clipper account/post
              </p>
              <p className="mt-1 text-slate-500">
                Views per account aren&apos;t guaranteed — a post can get anywhere from a few hundred to well over a
                million views depending on that clipper&apos;s own reach. You&apos;re paying for {accounts || 0}{" "}
                clipper slot{accounts === 1 ? "" : "s"}, not a fixed view count.
              </p>
              <p className="mt-2 font-semibold text-ink">Estimated platform fee (15%): {formatCurrency(estimatedFee)}</p>
              <p className="font-semibold text-ink">Estimated total campaign budget: {formatCurrency(estimatedTotal)}</p>
            </div>

            {eligibleCount !== null && accounts > eligibleCount ? (
              <p className="text-sm text-warning-700">
                Only {eligibleCount.toLocaleString()} clipper{eligibleCount === 1 ? "" : "s"} currently match your
                targeting — you can still fund {accounts} slots, but some may go unfilled until more clippers join or
                connect a matching account.
              </p>
            ) : null}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {name}</p>
            <p>
              <strong>Categories:</strong>{" "}
              {selectedCategoryIds.length > 0
                ? categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.name).join(", ")
                : "Open to all clippers"}
            </p>
            <p><strong>Clipper accounts:</strong> {accounts || "—"}</p>
            <p><strong>Duration:</strong> {durationDays ? `${durationDays} days` : "Not set"}</p>
            <p><strong>Creator budget:</strong> {formatCurrency(Math.round(creatorBudgetRupees * 100))}</p>
            <p><strong>Estimated total:</strong> {formatCurrency(estimatedTotal)}</p>
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-danger-600">{error}</p> : null}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !name) || (step === 1 && (uploading || !mediaUrl)) || (step === 4 && !accounts)}
            >
              Next
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" loading={busy} onClick={() => submit(false)}>Save as Draft</Button>
              <Button loading={busy} onClick={() => submit(true)}>Submit for Review</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
