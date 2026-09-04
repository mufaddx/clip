"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Field, Input, Button, Badge } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

interface Me {
  email: string;
  role: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface BrandProfileData {
  companyName: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  categories: { category: CategoryOption }[];
}

// /profile — see docs/ui-ux/PAGE_SPECIFICATIONS.md. Backed by GET/PATCH
// /v1/brands/me for the editable brand profile plus GET /v1/users/me for
// account-level fields (email, role) that don't live on BrandProfile.
export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [brand, setBrand] = useState<BrandProfileData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchClient<Me>("/v1/users/me").then(setMe).catch(() => setMe(null));
    apiFetchClient<CategoryOption[]>("/v1/categories").then(setCategories).catch(() => setCategories([]));
    apiFetchClient<BrandProfileData>("/v1/brands/me")
      .then((b) => {
        setBrand(b);
        setCompanyName(b.companyName ?? "");
        setWebsite(b.website ?? "");
        setIndustry(b.industry ?? "");
        setSize(b.size ?? "");
        setSelectedCategoryIds(b.categories.map((c) => c.category.id));
      })
      .catch(() => setBrand(null));
  }, []);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await apiFetchClient<BrandProfileData>("/v1/brands/me", {
        method: "PATCH",
        body: JSON.stringify({
          companyName,
          website: website || undefined,
          industry: industry || undefined,
          size: size || undefined,
          categoryIds: selectedCategoryIds,
        }),
      });
      setBrand(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (companyName || me?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" description="Your company's presence to Vidlix's creator network." />

      <Card className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-ink">{companyName || "Add your company name below"}</p>
            <p className="truncate text-sm text-slate-500">{me?.email ?? "…"}</p>
          </div>
          <Badge variant="neutral">{me?.role.replace("_", " ") ?? "…"}</Badge>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
          <Field label="Company name"><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Website"><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></Field>
            <Field label="Industry"><Input value={industry} onChange={(e) => setIndustry(e.target.value)} /></Field>
          </div>
          <Field label="Company size" helperText="e.g. 1-10, 11-50, 51-200.">
            <Input value={size} onChange={(e) => setSize(e.target.value)} />
          </Field>
          <Field
            label="Content categories"
            helperText="A default targeting hint for new campaigns — each campaign can still narrow this further."
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
      </Card>
    </div>
  );
}
