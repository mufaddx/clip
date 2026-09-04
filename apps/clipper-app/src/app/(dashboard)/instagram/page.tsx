"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader, Card, EmptyState, Badge, Button } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";
import type { InstagramAccount } from "../../../lib/types";

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
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((a) => (
            <Card key={a.id}>
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
          ))}
        </div>
      )}
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
