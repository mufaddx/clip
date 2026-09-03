// /terms — placeholder structure; real legal text needs actual legal review before launch.
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-400">Placeholder — needs legal review before this reflects real, enforceable terms.</p>

      <div className="mt-8 space-y-6 text-sm text-slate-600">
        <section>
          <h2 className="font-semibold text-ink">Accounts</h2>
          <p className="mt-1">One primary role per account — a brand or a clipper, not both. Admin roles are granted, not self-service.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Campaigns &amp; payments</h2>
          <p className="mt-1">Brands fund campaigns in advance; creator earnings are calculated from verified performance and become withdrawable after a campaign&apos;s verification window closes.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Disputes</h2>
          <p className="mt-1">Either party may open a dispute against a specific outcome; resolutions are decided by CLIP&apos;s platform team based on submitted evidence.</p>
        </section>
      </div>
    </main>
  );
}
