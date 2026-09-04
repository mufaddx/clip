"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, StatCard, EmptyState, Badge, Input, Button } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

interface Referral {
  id: string;
  status: string;
  createdAt: string;
  referred: { email: string; createdAt: string };
  reward: { amount: number } | null;
}

interface Me {
  referralCode: string;
}

// /referrals — see docs/referrals/REFERRAL_SYSTEM.md "Referral dashboard".
export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetchClient<Referral[]>("/v1/referrals/me").then(setReferrals).catch(() => setReferrals([]));
    apiFetchClient<Me>("/v1/users/me").then(setMe).catch(() => setMe(null));
  }, []);

  const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = me ? `${publicUrl}/signup?ref=${me.referralCode}` : "";

  const total = referrals?.length ?? 0;
  const pending = referrals?.filter((r) => r.status === "PENDING").length ?? 0;
  const rewarded = referrals?.filter((r) => r.status === "REWARDED").length ?? 0;
  const earnings = referrals?.reduce((sum, r) => sum + (r.reward?.amount ?? 0), 0) ?? 0;

  return (
    <div>
      <PageHeader title="Referral Program" description="Invite others to Vidlix and earn rewards." />

      <Card>
        <p className="text-sm font-medium text-slate-700">Your referral link</p>
        <div className="mt-2 flex gap-2">
          <Input readOnly value={link} className="flex-1" />
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Referrals" value={total} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Successful" value={rewarded} />
        <StatCard label="Referral Earnings" value={earnings} />
      </div>

      <Card className="mt-4">
        {referrals === null ? (
          <EmptyState title="Loading…" />
        ) : referrals.length === 0 ? (
          <EmptyState title="No referrals yet" description="Share your link to start earning." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-600">{r.referred.email}</span>
                <Badge variant={r.status === "REWARDED" ? "success" : r.status === "FLAGGED" ? "danger" : "warning"}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
