import Link from "next/link";
import { PageHeader, Card, EmptyState, Table, TableHead, TableRow, TableHeaderCell, TableCell } from "@clip/ui";
import { apiFetch } from "../../../lib/api-client.server";
import type { Campaign } from "../../../lib/types";

interface CreatorRow {
  id: string;
  status: string;
  creator: { displayName: string; trustScore: number };
  reels: Array<{ id: string; status: string; calculations: Array<{ score: number }> }>;
}

/**
 * /creators — cross-campaign creator performance. See
 * docs/ui-ux/PAGE_SPECIFICATIONS.md "Brand app" (Creator Performance).
 * Aggregates the per-campaign creators endpoint across the brand's active
 * campaigns (capped at 10) rather than a dedicated backend rollup — fine
 * at this scale, revisit if it gets slow (see
 * docs/architecture/SCALABILITY_ARCHITECTURE.md).
 */
export default async function CreatorsPage() {
  const campaigns = await apiFetch<Campaign[]>("/v1/campaigns?status=LIVE").catch(() => []);
  const rows = await Promise.all(
    campaigns.slice(0, 10).map((c) =>
      apiFetch<CreatorRow[]>(`/v1/campaigns/${c.id}/creators`)
        .then((creators) => creators.map((cr) => ({ ...cr, campaignName: c.name })))
        .catch(() => [])
    )
  );
  const flat = rows.flat();

  return (
    <div>
      <PageHeader title="Creator Performance" />
      <Card>
        {flat.length === 0 ? (
          <EmptyState title="No creators yet" description="Creator performance appears here once campaigns go live." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Creator</TableHeaderCell>
                <TableHeaderCell>Campaign</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Latest Score</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {flat.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.creator.displayName}</TableCell>
                  <TableCell>{(c as unknown as { campaignName: string }).campaignName}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell className="text-right">{c.reels[0]?.calculations[0]?.score.toFixed(3) ?? "—"}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <p className="mt-3 text-xs text-slate-400">
        Looking for one campaign&apos;s creators specifically? Open it from <Link href="/campaigns" className="underline">Campaigns</Link>.
      </p>
    </div>
  );
}
