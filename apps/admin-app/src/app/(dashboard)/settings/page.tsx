"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Field, Input, Button } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

// /settings — see docs/admin/ADMIN_PANEL.md "Settings".
export default function SettingsPage() {
  const [feeRate, setFeeRate] = useState<number | null>(null);
  const [settlementDays, setSettlementDays] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetchClient<{ value: number }>("/v1/admin/settings/platform_fee_rate").then((s) => setFeeRate(s.value)).catch(() => setFeeRate(null));
    apiFetchClient<{ value: number }>("/v1/admin/settings/earnings_settlement_window_days").then((s) => setSettlementDays(s.value)).catch(() => setSettlementDays(null));
  }, []);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      if (feeRate != null) await apiFetchClient("/v1/admin/settings/platform_fee_rate", { method: "PATCH", body: JSON.stringify({ value: feeRate }) });
      if (settlementDays != null) await apiFetchClient("/v1/admin/settings/earnings_settlement_window_days", { method: "PATCH", body: JSON.stringify({ value: settlementDays }) });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <Card className="max-w-sm">
        <div className="flex flex-col gap-3">
          <Field label="Platform fee rate" helperText="Locked in per-campaign at funding time — changing this doesn't affect already-funded campaigns.">
            <Input type="number" step="0.01" value={feeRate ?? ""} onChange={(e) => setFeeRate(Number(e.target.value))} />
          </Field>
          <Field label="Earnings settlement window (days)">
            <Input type="number" value={settlementDays ?? ""} onChange={(e) => setSettlementDays(Number(e.target.value))} />
          </Field>
          {saved ? <p className="text-sm text-success-700">Saved.</p> : null}
          <Button onClick={save} loading={busy}>Save</Button>
        </div>
      </Card>
    </div>
  );
}
