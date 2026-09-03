// /how-it-works — expanded brand + clipper flow diagrams. See docs/product/PRODUCT_OVERVIEW.md "Core value loop".
export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-3xl font-bold text-ink">How CLIP works</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        One value loop connects brands, clippers, and the platform team — every other feature
        exists to support, protect, or report on it.
      </p>

      <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6 font-mono text-xs leading-relaxed text-slate-600">
        Brand funds a campaign{"\n"}
        {"        ↓"}{"\n"}
        Clippers discover and accept the campaign{"\n"}
        {"        ↓"}{"\n"}
        Clippers publish approved content on Instagram{"\n"}
        {"        ↓"}{"\n"}
        CLIP tracks performance via the Meta Graph API{"\n"}
        {"        ↓"}{"\n"}
        Performance is validated against campaign rules → Qualified Performance{"\n"}
        {"        ↓"}{"\n"}
        Creator earnings are calculated and posted to the creator wallet{"\n"}
        {"        ↓"}{"\n"}
        Brand sees verified campaign results; Creator withdraws earnings
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-semibold text-ink">For Brands</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>Create Account</li>
            <li>Create Campaign</li>
            <li>Add Campaign Funding</li>
            <li>Define Requirements</li>
            <li>Launch Campaign</li>
            <li>Creators Participate</li>
            <li>Performance Is Tracked</li>
            <li>Campaign Results Are Delivered</li>
          </ol>
        </div>
        <div>
          <h2 className="font-semibold text-ink">For Clippers</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>Create Account</li>
            <li>Complete Profile</li>
            <li>Connect Eligible Account</li>
            <li>Discover Campaigns</li>
            <li>Accept Campaign</li>
            <li>Publish Approved Content</li>
            <li>Submit or Verify Reel</li>
            <li>Performance Is Tracked</li>
            <li>Earnings Are Calculated</li>
            <li>Withdraw Earnings</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
