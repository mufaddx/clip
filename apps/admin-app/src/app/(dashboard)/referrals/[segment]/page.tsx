"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, StatCard, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell, Badge, Button, Field, Input, Select } from "@clip/ui";
import { formatDate } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { ReferralRow } from "../../../../lib/types";

interface ReferralRules {
  rewardType: "FIXED" | "PERCENTAGE";
  rewardAmount: number;
  maxReward: number;
  expirationDays: number;
  perUserCap: number;
}

// /referrals/{overview,list,rewards,rules} — see docs/admin/ADMIN_PANEL.md "Referral System".
export default function ReferralsSegmentPage() {
  const { segment } = useParams<{ segment: string }>();

  if (segment === "rules") return <RulesEditor />;
  if (segment === "overview") return <Overview />;
  return <ReferralList onlyRewarded={segment === "rewards"} />;
}

function Overview() {
  const [referrals, setReferrals] = useState<ReferralRow[] | null>(null);
  useEffect(() => {
    apiFetchClient<ReferralRow[]>("/v1/referrals/all").then(setReferrals).catch(() => setReferrals([]));
  }, []);

  const total = referrals?.length ?? 0;
  const flagged = referrals?.filter((r) => r.status === "FLAGGED").length ?? 0;
  const rewarded = referrals?.filter((r) => r.status === "REWARDED").length ?? 0;

  return (
    <div>
      <PageHeader title="Referral Overview" />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Referrals" value={total} />
        <StatCard label="Rewarded" value={rewarded} />
        <StatCard label="Flagged" value={flagged} />
      </div>
    </div>
  );
}

function ReferralList({ onlyRewarded }: { onlyRewarded: boolean }) {
  const [referrals, setReferrals] = useState<ReferralRow[] | null>(null);

  async function load() {
    const qs = onlyRewarded ? "?status=REWARDED" : "";
    apiFetchClient<ReferralRow[]>(`/v1/referrals/all${qs}`).then(setReferrals).catch(() => setReferrals([]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyRewarded]);

  async function decide(id: string, approve: boolean) {
    await apiFetchClient(`/v1/referrals/${id}/decide`, { method: "PATCH", body: JSON.stringify({ approve }) });
    await load();
  }

  return (
    <div>
      <PageHeader title={onlyRewarded ? "Rewards" : "Referrals"} />
      <Card>
        {referrals === null ? (
          <EmptyState title="Loading…" />
        ) : referrals.length === 0 ? (
          <EmptyState title="No referrals" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Referrer</TableHeaderCell>
                <TableHeaderCell>Referred</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <tbody>
              {referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.referrer.email}</TableCell>
                  <TableCell>{r.referred.email}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "REWARDED" ? "success" : r.status === "FLAGGED" ? "danger" : "warning"}>{r.status}</Badge>
                    {r.flaggedReason ? <p className="mt-1 text-xs text-slate-400">{r.flaggedReason}</p> : null}
                  </TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>
                    {r.status === "FLAGGED" ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => decide(r.id, true)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => decide(r.id, false)}>Deny</Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function RulesEditor() {
  const [rules, setRules] = useState<ReferralRules | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetchClient<{ value: ReferralRules }>("/v1/admin/settings/referral_rules").then((s) => setRules(s.value)).catch(() => setRules(null));
  }, []);

  async function save() {
    if (!rules) return;
    setBusy(true);
    setSaved(false);
    try {
      await apiFetchClient("/v1/admin/settings/referral_rules", { method: "PATCH", body: JSON.stringify({ value: rules }) });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  if (!rules) return <EmptyState title="Loading…" />;

  return (
    <div>
      <PageHeader title="Referral Rules" description="Changes take effect for new referral evaluations immediately." />
      <Card className="mx-auto max-w-md">
        <div className="flex flex-col gap-3">
          <Field label="Reward type">
            <Select value={rules.rewardType} onChange={(e) => setRules({ ...rules, rewardType: e.target.value as "FIXED" | "PERCENTAGE" })}>
              <option value="FIXED">Fixed</option>
              <option value="PERCENTAGE">Percentage</option>
            </Select>
          </Field>
          <Field label="Reward amount (minor units)">
            <Input type="number" value={rules.rewardAmount} onChange={(e) => setRules({ ...rules, rewardAmount: Number(e.target.value) })} />
          </Field>
          <Field label="Max reward (minor units)">
            <Input type="number" value={rules.maxReward} onChange={(e) => setRules({ ...rules, maxReward: Number(e.target.value) })} />
          </Field>
          <Field label="Expiration (days)">
            <Input type="number" value={rules.expirationDays} onChange={(e) => setRules({ ...rules, expirationDays: Number(e.target.value) })} />
          </Field>
          <Field label="Per-user cap">
            <Input type="number" value={rules.perUserCap} onChange={(e) => setRules({ ...rules, perUserCap: Number(e.target.value) })} />
          </Field>
          {saved ? <p className="text-sm text-success-700">Saved.</p> : null}
          <Button onClick={save} loading={busy}>Save</Button>
        </div>
      </Card>
    </div>
  );
}
