"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select, Textarea, PageHeader } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";

const OBJECTIVES = ["DISTRIBUTION", "VIEWS", "REACH", "ENGAGEMENT", "QUALITY_PERFORMANCE"] as const;
const DEFAULT_OBJECTIVE: (typeof OBJECTIVES)[number] = "VIEWS";
const STEPS = ["Basic Information", "Content", "Creator Requirements", "Performance Targets", "Budget", "Review"];

/**
 * Campaign creation — see docs/campaigns/CAMPAIGN_CREATION_FLOW.md. All six
 * steps are collected client-side and posted as one draft on Review (Step
 * 4's objective selection is folded into Step 1 here since the backend's
 * CreateCampaignDto takes it up front); "Submit for Review" then calls
 * /submit, matching docs/campaigns/CAMPAIGN_LIFECYCLE.md.
 */
export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState<string>(DEFAULT_OBJECTIVE);
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
  const [maxParticipants, setMaxParticipants] = useState("");
  const [creatorBudget, setCreatorBudget] = useState("");

  const estimatedFee = Math.round(Number(creatorBudget || 0) * 100 * 0.15); // 15% default, real rate locked at funding time
  const estimatedTotal = Math.round(Number(creatorBudget || 0) * 100) + estimatedFee;

  // Direct browser-to-R2 upload (see docs/campaigns/CAMPAIGN_CREATION_FLOW.md
  // "Assets" and apps/api's UploadsService): the API only signs a short-lived
  // PUT URL — the file bytes never pass through this Next.js app or the API,
  // they go straight from the browser to the bucket.
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
          type: type || undefined,
          description: description || undefined,
          objective,
          creatorBudget: Math.round(Number(creatorBudget || 0) * 100),
          maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
          requirements: {
            minFollowers: minFollowers ? Number(minFollowers) : undefined,
            minTrustScore: minTrustScore ? Number(minTrustScore) : undefined,
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

      <div className="mb-6 flex gap-2 text-xs font-medium text-slate-400">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? "text-brand-700" : ""}>
            {i + 1}. {s}{i < STEPS.length - 1 ? " → " : ""}
          </span>
        ))}
      </div>

      <Card className="max-w-2xl">
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <Field label="Campaign Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Campaign Type"><Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. product launch" /></Field>
            <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            <Field label="Objective">
              <Select value={objective} onChange={(e) => setObjective(e.target.value)}>
                {OBJECTIVES.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
              </Select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <Field
              label="Campaign creative (image or video)"
              helperText={uploading ? "Uploading…" : mediaUrl ? `Uploaded: ${uploadedFileName}` : "This is what clippers will see and be asked to publish."}
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
            <Field label="Minimum followers"><Input type="number" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} /></Field>
            <Field label="Minimum trust score (0-100)"><Input type="number" value={minTrustScore} onChange={(e) => setMinTrustScore(e.target.value)} /></Field>
            <Field label="Maximum participants"><Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} /></Field>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm text-slate-600">
              Performance target: <strong>{objective.replace("_", " ")}</strong> (set in Step 1 — this determines which
              qualified-performance rule set applies to this campaign&apos;s reels).
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-3">
            <Field label="Creator Budget (₹)"><Input type="number" min="0" value={creatorBudget} onChange={(e) => setCreatorBudget(e.target.value)} required /></Field>
            <p className="text-sm text-slate-500">Estimated platform fee (15%): {formatCurrency(estimatedFee)}</p>
            <p className="text-sm font-semibold text-ink">Estimated total campaign budget: {formatCurrency(estimatedTotal)}</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Objective:</strong> {objective.replace("_", " ")}</p>
            <p><strong>Creator budget:</strong> {formatCurrency(Math.round(Number(creatorBudget || 0) * 100))}</p>
            <p><strong>Estimated total:</strong> {formatCurrency(estimatedTotal)}</p>
            <p><strong>Max participants:</strong> {maxParticipants || "Unlimited"}</p>
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-danger-600">{error}</p> : null}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={(step === 0 && !name) || (step === 1 && uploading)}>Next</Button>
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
