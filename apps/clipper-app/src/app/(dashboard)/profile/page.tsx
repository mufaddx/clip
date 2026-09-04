"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Field, Input, Textarea, Button, Badge, IconCopy, IconCheck } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

interface Me {
  email: string;
  role: string;
  createdAt: string;
  referralCode: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface CreatorProfileData {
  displayName: string;
  bio: string | null;
  trustScore: number;
  categories: { category: CategoryOption }[];
}

// /profile — see docs/ui-ux/PAGE_SPECIFICATIONS.md. Backed by two real
// endpoints: GET/PATCH /v1/clippers/me for the editable creator profile
// (name, bio, categories) and GET /v1/users/me for account-level fields
// (email, role, referral code) that don't live on CreatorProfile.
export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [creator, setCreator] = useState<CreatorProfileData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetchClient<Me>("/v1/users/me").then(setMe).catch(() => setMe(null));
    apiFetchClient<CategoryOption[]>("/v1/categories").then(setCategories).catch(() => setCategories([]));
    apiFetchClient<CreatorProfileData>("/v1/clippers/me")
      .then((c) => {
        setCreator(c);
        setDisplayName(c.displayName ?? "");
        setBio(c.bio ?? "");
        setSelectedCategoryIds(c.categories.map((c) => c.category.id));
      })
      .catch(() => setCreator(null));
  }, []);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await apiFetchClient<CreatorProfileData>("/v1/clippers/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, bio: bio || undefined, categoryIds: selectedCategoryIds }),
      });
      setCreator(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (displayName || me?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" description="How you show up to brands, and what you're eligible for." />

      <Card className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-ink">{displayName || "Add your name below"}</p>
            <p className="truncate text-sm text-slate-500">{me?.email ?? "…"}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold text-ink">{creator ? Math.round(creator.trustScore) : "—"}</p>
            <p className="text-xs text-slate-400">Trust score</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
          <Field label="Display name" helperText="Shown to brands reviewing your campaign submissions.">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Field label="Bio">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A line or two about the content you make." />
          </Field>
          <Field
            label="Content categories"
            helperText="Campaigns are matched to clippers by category — pick what you actually post."
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

          {error ? <p className="text-sm text-danger-600">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button onClick={save} loading={saving}>Save changes</Button>
            {saved ? <span className="text-sm font-medium text-success-700">Saved.</span> : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <div>
            <p className="text-sm font-medium text-slate-700">Your referral code</p>
            <p className="mt-1 text-xs text-slate-500">
              Share it, or use the{" "}
              <Link href="/referrals" className="text-brand-600 hover:underline">full referral program page</Link>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!me?.referralCode) return;
              navigator.clipboard.writeText(me.referralCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-mono font-medium text-slate-700 hover:border-slate-300"
          >
            {me?.referralCode ?? "…"}
            {copied ? <IconCheck className="h-3.5 w-3.5 text-success-600" /> : <IconCopy className="h-3.5 w-3.5 text-slate-400" />}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Badge variant="neutral">{me?.role ?? "…"}</Badge>
          <span>Member since {me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "…"}</span>
        </div>
      </Card>
    </div>
  );
}
