// /acceptable-use — placeholder structure; real legal text needs actual legal review before launch.
export default function AcceptableUsePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Acceptable Use &amp; Community Guidelines</h1>
      <p className="mt-2 text-sm text-slate-500">Placeholder — needs legal review before this reflects real, enforceable terms.</p>

      <div className="mt-8 space-y-6 text-sm text-slate-400">
        <section>
          <h2 className="font-semibold text-white">Content</h2>
          <p className="mt-1">
            No illegal content, hate speech, harassment, or content that violates Instagram&apos;s own
            community standards — Vidlix distribution rides on top of Instagram and inherits its rules.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Account integrity</h2>
          <p className="mt-1">
            One person per account, real Instagram accounts only — no bot followers, no automation
            that inflates views or engagement, and no self-referrals. Performance is checked against
            the official Meta Graph API, so inflated numbers are caught, not paid for.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Consequences</h2>
          <p className="mt-1">
            Violations can result in a campaign submission being rejected, a referral being flagged
            and denied, or — for repeated or serious violations — account suspension. See our{" "}
            <a href="/trust-safety" className="text-white underline hover:no-underline">Trust &amp; Safety</a> page
            for how this is enforced.
          </p>
        </section>
      </div>
    </main>
  );
}
