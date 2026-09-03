"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, Button, CampaignStatusBadge, PageHeader, Field, Select, Input, EmptyState } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../lib/api-client";
import type { Campaign, CampaignAcceptance, InstagramAccount } from "../lib/types";

interface CampaignWithDetails extends Campaign {
  assets?: Array<{ id: string; mediaUrl: string; caption: string | null; hashtags: string[]; requiredMentions: string[]; instructions: string | null }>;
}

/**
 * The full campaign detail view — see docs/campaigns/CAMPAIGN_SYSTEM.md
 * "Clipper campaign experience": Overview, Instructions/Content Assets,
 * Requirements, Submission, and Reel activity in one page rather than
 * separate tabs, given this app's current scope.
 */
export function CampaignDetail({ campaignAcceptanceOrId }: { campaignAcceptanceOrId: string }) {
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null);
  const [acceptance, setAcceptance] = useState<CampaignAcceptance | null>(null);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [c, mine, ig] = await Promise.all([
        apiFetchClient<CampaignWithDetails>(`/v1/campaigns/${campaignAcceptanceOrId}`),
        apiFetchClient<CampaignAcceptance[]>("/v1/campaigns/mine"),
        apiFetchClient<InstagramAccount[]>("/v1/instagram/accounts"),
      ]);
      setCampaign(c);
      setAcceptance(mine.find((a) => a.campaignId === campaignAcceptanceOrId) ?? null);
      setAccounts(ig);
      if (ig[0]) setSelectedAccount(ig[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load campaign.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignAcceptanceOrId]);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient(`/v1/campaigns/${campaignAcceptanceOrId}/accept`, {
        method: "POST",
        body: JSON.stringify({ instagramAccountId: selectedAccount }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept campaign.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReel(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptance) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/reels/submit", {
        method: "POST",
        body: JSON.stringify({ campaignCreatorId: acceptance.id, url: reelUrl }),
      });
      setReelUrl("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit reel.");
    } finally {
      setBusy(false);
    }
  }

  if (!campaign) return <EmptyState title={error ?? "Loading…"} />;

  return (
    <div>
      <PageHeader title={campaign.name} description={campaign.objective.replace("_", " ")} action={<CampaignStatusBadge status={campaign.status} />} />
      {error ? <p className="mb-4 text-sm text-danger-600">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <p className="text-sm text-slate-600">{campaign.description ?? "No description provided."}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium text-ink">Creator budget:</span> {formatCurrency(campaign.creatorBudget, campaign.currency)}
          </p>

          {campaign.assets?.length ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-semibold text-ink">Instructions &amp; content assets</h4>
              {campaign.assets.map((a) => (
                <div key={a.id} className="mb-2 text-sm text-slate-600">
                  <p>{a.instructions}</p>
                  {a.hashtags.length ? <p className="text-slate-400">Hashtags: {a.hashtags.join(", ")}</p> : null}
                  {a.requiredMentions.length ? <p className="text-slate-400">Mentions: {a.requiredMentions.join(", ")}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Min followers: {campaign.requirements?.minFollowers ?? "—"}</li>
            <li>Min trust score: {campaign.requirements?.minTrustScore ?? "—"}</li>
            {campaign.requirements?.contentRestrictions?.length ? (
              <li>Restrictions: {campaign.requirements.contentRestrictions.join(", ")}</li>
            ) : null}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Submission</CardTitle></CardHeader>

        {!acceptance ? (
          <div className="flex items-end gap-3">
            <Field label="Instagram account">
              <Select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>@{a.username}</option>
                ))}
              </Select>
            </Field>
            <Button onClick={accept} loading={busy} disabled={!selectedAccount}>
              Accept campaign
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={submitReel} className="flex items-end gap-3">
              <Field label="Reel URL" helperText="Paste the link to your published Instagram reel or post.">
                <Input value={reelUrl} onChange={(e) => setReelUrl(e.target.value)} placeholder="https://www.instagram.com/reel/…" required className="w-80" />
              </Field>
              <Button type="submit" loading={busy}>Submit reel</Button>
            </form>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-semibold text-ink">Your reels</h4>
              {acceptance.reels.length === 0 ? (
                <p className="text-sm text-slate-500">No reels submitted yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {acceptance.reels.map((r) => (
                    <li key={r.id} className="flex items-center justify-between">
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                        {r.url}
                      </a>
                      <CampaignStatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
