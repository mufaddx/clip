// /faq — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
const FAQS = [
  { q: "How is my performance verified?", a: "Every metric comes from the official Meta Graph API against your connected Instagram account — never scraped or self-reported." },
  { q: "When do I get paid?", a: "Earnings post as Pending as soon as qualified performance is calculated, then move to Available once the campaign's verification window closes without a successful dispute." },
  { q: "What if a brand disputes my content?", a: "Disputes go through a structured review process with evidence from both sides — a payout is only reversed after an admin decision, never automatically." },
  { q: "How does creator matching work?", a: "Campaigns are only shown to creators who meet the campaign's minimum requirements and category overlap — ranked by fit, not shown to everyone." },
  { q: "Is there a subscription fee?", a: "No — brands pay a transparent platform fee on top of each campaign's creator budget, shown before funding. Clippers never pay a fee." },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Frequently asked questions</h1>
      <div className="mt-8 divide-y divide-white/10">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-white">{f.q}</summary>
            <p className="mt-2 text-sm text-slate-400">{f.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
