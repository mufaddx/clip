import Link from "next/link";
import { PageHeader, StatCard, Button } from "@clip/ui";
import { formatCurrency } from "@clip/utilities";
import { apiFetch } from "../../../lib/api-client";
import type { Wallet } from "../../../lib/types";

// /wallet/overview — see docs/finance/WALLET_SYSTEM.md "Brand wallet buckets".
export default async function WalletOverviewPage() {
  const wallet = await apiFetch<Wallet>("/v1/wallet").catch(() => null);

  return (
    <div>
      <PageHeader title="Wallet" action={<Link href="/wallet/add-funds"><Button>Add Funds</Button></Link>} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Available" value={formatCurrency(wallet?.availableBalance ?? 0)} />
        <StatCard label="Locked" value={formatCurrency(wallet?.lockedBalance ?? 0)} />
        <StatCard label="Spent" value={formatCurrency(wallet?.spentBalance ?? 0)} />
        <StatCard label="Refundable" value={formatCurrency(wallet?.refundableBalance ?? 0)} />
      </div>
    </div>
  );
}
