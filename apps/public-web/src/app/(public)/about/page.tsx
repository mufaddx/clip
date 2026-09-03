// /about — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold text-ink">About Vidlix</h1>
      <p className="mt-4 text-slate-600">
        Vidlix connects brands who want their content distributed with a network of creators who
        publish it and get paid on verified, qualified performance — not vanity views. We built
        Vidlix because influencer marketing shouldn&apos;t require an agency, and creator payouts
        shouldn&apos;t be a black box.
      </p>
      <p className="mt-4 text-slate-600">
        Every number that affects a payout traces back to an official Meta Graph API snapshot and
        an auditable calculation — see how the whole system fits together in{" "}
        <a href="/how-it-works" className="text-brand-600 hover:underline">How Vidlix Works</a>.
      </p>
    </main>
  );
}
