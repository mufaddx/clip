"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Field, Input, Button } from "@clip/ui";
import { apiFetchClient } from "../../../../lib/api-client";

// /wallet/add-funds — see docs/finance/PAYMENT_SYSTEM.md "Deposit flow".
// Uses the dev-only simulate endpoint since no payment provider is
// configured yet (see PaymentsService) — the "success" path here mirrors
// what the real provider webhook confirmation will do once wired in.
export default function AddFundsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetchClient("/v1/wallet/deposits/simulate", {
        method: "POST",
        body: JSON.stringify({ amount: Math.round(Number(amount) * 100) }),
      });
      router.push("/wallet");
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} (no payment provider is configured on this deployment yet — see PaymentsService)`
          : "Failed to add funds."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Add Funds" />
      <Card className="max-w-sm">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field label="Amount (₹)">
            <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </Field>
          {error ? <p className="text-sm text-danger-600">{error}</p> : null}
          <Button type="submit" loading={busy}>Add Funds</Button>
        </form>
      </Card>
    </div>
  );
}
