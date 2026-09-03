// /pricing — see docs/product/PRODUCT_REQUIREMENTS.md and docs/campaigns/CAMPAIGN_CREATION_FLOW.md "Budget".
export default function PricingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Pricing</h1>
      <p className="mt-4 text-slate-400">
        No subscription fees. Brands fund campaigns directly and pay a transparent platform fee
        (currently 15%, admin-configurable) on top of the creator budget — shown up front in the
        campaign wizard before you fund anything.
      </p>
      <div className="mt-8 rounded-lg border border-white/10 p-6">
        <p className="text-sm text-slate-400">Example</p>
        <p className="mt-1 text-2xl font-semibold text-white">₹1,000 creator budget</p>
        <p className="mt-1 text-sm text-slate-400">+ ₹150 platform fee (15%) = ₹1,150 total campaign budget</p>
      </div>
      <p className="mt-6 text-sm text-slate-400">Clippers keep 100% of their calculated earnings — Vidlix&apos;s fee is charged to the brand, never deducted from creator payouts.</p>
    </main>
  );
}
