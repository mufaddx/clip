"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Card, CardHeader, CardTitle, StatCard, EmptyState, Field, Input, Select, Button } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetchClient } from "../../../../lib/api-client";
import type { PlatformOverview } from "../../../../lib/types";

const OBJECTIVES = ["DISTRIBUTION", "VIEWS", "REACH", "ENGAGEMENT", "QUALITY_PERFORMANCE"] as const;
const DEFAULT_OBJECTIVE: (typeof OBJECTIVES)[number] = "VIEWS";

interface PerformanceRule {
  version: number;
  weights: { watchQuality: number; engagementQuality: number; reachQuality: number; campaignCompliance: number; historicalReliability: number };
  riskThresholds: { anomalyZScoreFlag: number };
}

// /performance/{overview,metric-tracking,qualified-performance,suspicious-activity} — see docs/admin/ADMIN_PANEL.md.
export default function PerformanceSegmentPage() {
  const { segment } = useParams<{ segment: string }>();

  if (segment === "qualified-performance") return <RuleEditor />;
  if (segment === "overview") return <Overview />;

  return (
    <div>
      <PageHeader title={`Performance — ${segment.replace("-", " ")}`} />
      <Card>
        <EmptyState
          title="Not built yet"
          description={segment === "metric-tracking" ? "Raw metric snapshot browsing is a later pass." : "Suspicious-activity detail view is a later pass — see Clippers → Risk Review for flagged accounts in the meantime."}
        />
      </Card>
    </div>
  );
}

function Overview() {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  useEffect(() => {
    apiFetchClient<PlatformOverview>("/v1/analytics/platform").then(setOverview).catch(() => setOverview(null));
  }, []);

  return (
    <div>
      <PageHeader title="Performance Overview" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Qualified Performance" value={overview?.totalQualifiedPerformance?.toFixed(2) ?? "0"} />
        <StatCard label="Active Campaigns" value={overview?.activeCampaigns ?? 0} />
        <StatCard label="Platform Revenue" value={formatCurrency(overview?.platformRevenue ?? 0)} />
      </div>
    </div>
  );
}

function RuleEditor() {
  const [objective, setObjective] = useState<string>(DEFAULT_OBJECTIVE);
  const [rule, setRule] = useState<PerformanceRule | null>(null);
  const [weights, setWeights] = useState({ watchQuality: 0.2, engagementQuality: 0.25, reachQuality: 0.2, campaignCompliance: 0.2, historicalReliability: 0.15 });
  const [anomaly, setAnomaly] = useState(3);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetchClient<PerformanceRule>(`/v1/performance/rules/${objective}`)
      .then((r) => {
        setRule(r);
        setWeights(r.weights);
        setAnomaly(r.riskThresholds.anomalyZScoreFlag);
      })
      .catch(() => setRule(null));
  }, [objective]);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      await apiFetchClient("/v1/performance/rules", {
        method: "POST",
        body: JSON.stringify({ objective, weights, anomalyZScoreFlag: anomaly }),
      });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Qualified Performance Rules" description="Saving creates a new version — see docs/performance/PERFORMANCE_SCORING.md." />
      <Card className="mx-auto max-w-lg">
        <CardHeader><CardTitle>Objective: {rule ? `v${rule.version}` : ""}</CardTitle></CardHeader>
        <div className="flex flex-col gap-3">
          <Field label="Objective">
            <Select value={objective} onChange={(e) => setObjective(e.target.value)}>
              {OBJECTIVES.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
            </Select>
          </Field>
          {(Object.keys(weights) as Array<keyof typeof weights>).map((key) => (
            <Field key={key} label={key}>
              <Input
                type="number"
                step="0.01"
                value={weights[key]}
                onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))}
              />
            </Field>
          ))}
          <Field label="Anomaly z-score flag threshold">
            <Input type="number" step="0.1" value={anomaly} onChange={(e) => setAnomaly(Number(e.target.value))} />
          </Field>
          {saved ? <p className="text-sm text-success-700">Saved as a new version.</p> : null}
          <Button onClick={save} loading={busy}>Save new version</Button>
        </div>
      </Card>
    </div>
  );
}
