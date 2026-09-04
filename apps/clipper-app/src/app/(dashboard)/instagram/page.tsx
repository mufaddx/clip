"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader, Card, StatCard, EmptyState, Badge, Button } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";
import type { InstagramAccount, InstagramProfileStats, InstagramMediaItem } from "../../../lib/types";

// /instagram — see docs/ui-ux/PAGE_SPECIFICATIONS.md and
// docs/architecture/META_INSTAGRAM_INTEGRATION.md "Account authorization flow".
function InstagramPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accounts, setAccounts] = useState<InstagramAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Set by the OAuth callback redirect (?connected=1|0) — see
  // InstagramController.oauthCallback. Cleared from the URL after reading
  // so refreshing the page doesn't keep re-showing it.
  const [justConnected, setJustConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected !== null) {
      setJustConnected(connected === "1");
      router.replace("/instagram");
    }
  }, [searchParams, router]);

  useEffect(() => {
    apiFetchClient<InstagramAccount[]>("/v1/instagram/accounts").then(setAccounts).catch((e) => setError(e.message));
  }, [justConnected]);

  async function connect() {
    try {
      const { url } = await apiFetchClient<{ url: string }>("/v1/instagram/oauth/start");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Instagram isn't configured on this deployment yet.");
    }
  }

  async function disconnect(id: string) {
    await apiFetchClient(`/v1/instagram/accounts/${id}`, { method: "DELETE" });
    setAccounts((prev) => prev?.filter((a) => a.id !== id) ?? null);
  }

  return (
    <div>
      <PageHeader title="My Instagram" description="Connect the account you'll publish campaign content from." action={<Button onClick={connect}>Connect Instagram</Button>} />
      {justConnected === true ? (
        <p className="mb-4 rounded-md bg-success-50 px-3 py-2 text-sm text-success-700">Instagram account connected.</p>
      ) : justConnected === false ? (
        <p className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-600">
          Couldn&apos;t connect that Instagram account — please try again.
        </p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-danger-600">{error}</p> : null}

      {accounts === null ? (
        <Card><EmptyState title="Loading…" /></Card>
      ) : accounts.length === 0 ? (
        <Card>
          <EmptyState
            title="Connect your Instagram account"
            description="Required before you can accept a campaign."
            action={<Button onClick={connect}>Connect Instagram</Button>}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {accounts.map((a) => (
            <div key={a.id} className="flex flex-col gap-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink">@{a.username}</p>
                    <p className="text-sm text-slate-500">{a.accountType ?? "—"}</p>
                  </div>
                  <Badge variant={a.connectionHealth === "HEALTHY" ? "success" : "danger"}>{a.connectionHealth}</Badge>
                </div>
                <Button variant="destructive" size="sm" className="mt-4" onClick={() => disconnect(a.id)}>
                  Disconnect
                </Button>
              </Card>
              <AccountProfile accountId={a.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Live followers/media-count + a grid of recent posts, pulled from
// Instagram directly (not the DB) since these change constantly — see
// InstagramService.getAccountStats/listRecentMediaForCreator. Kept as its
// own component so one account's profile fetch failing doesn't blank out
// the account list above it.
function AccountProfile({ accountId }: { accountId: string }) {
  const [stats, setStats] = useState<InstagramProfileStats | null>(null);
  const [media, setMedia] = useState<InstagramMediaItem[] | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setStats(null);
    setMedia(null);
    setProfileError(null);
    apiFetchClient<InstagramProfileStats>(`/v1/instagram/accounts/${accountId}/profile`)
      .then(setStats)
      .catch((e) => setProfileError(e instanceof Error ? e.message : "Couldn't load profile stats."));
    apiFetchClient<InstagramMediaItem[]>(`/v1/instagram/accounts/${accountId}/media`)
      .then(setMedia)
      .catch(() => setMedia([])); // non-fatal — the grid just shows empty if this fails
  }, [accountId]);

  if (profileError) {
    return <p className="text-sm text-danger-600">{profileError}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Followers" value={stats?.followers_count?.toLocaleString() ?? "—"} loading={!stats} />
        <StatCard label="Posts" value={stats?.media_count?.toLocaleString() ?? "—"} loading={!stats} />
        <StatCard label="Account type" value={stats?.account_type ?? "—"} loading={!stats} />
      </div>

      <Card>
        <p className="mb-3 text-sm font-semibold text-ink">Recent posts</p>
        {media === null ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : media.length === 0 ? (
          <EmptyState title="No posts yet" description="Once you publish on Instagram, your recent posts will show up here." />
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {media.map((m) => (
              <a
                key={m.id}
                href={m.permalink}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-md bg-slate-100"
                title={m.caption ?? undefined}
              >
                {m.thumbnail_url ?? m.media_url ? (
                  // Instagram-hosted CDN URLs are short-lived and per-account —
                  // not worth routing through next/image's remote-pattern config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.thumbnail_url ?? m.media_url} alt={m.caption ?? "Instagram post"} className="h-full w-full object-cover" />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1.5 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span>♥ {m.like_count ?? 0}</span>
                  <span>💬 {m.comments_count ?? 0}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function InstagramPage() {
  return (
    <Suspense>
      <InstagramPageContent />
    </Suspense>
  );
}
