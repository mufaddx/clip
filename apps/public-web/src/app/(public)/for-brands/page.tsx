import Link from "next/link";
import { Button } from "@clip/ui";

// /for-brands — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
export default function ForBrandsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold text-ink">Reach creators, pay for real performance</h1>
      <p className="mt-4 text-slate-600">
        Launch a campaign, set your budget and requirements, and let CLIP&apos;s creator network
        distribute your content — you only pay against qualified, verified performance, never raw
        view counts alone.
      </p>

      <ul className="mt-8 space-y-3 text-sm text-slate-600">
        <li>• Set eligibility requirements — minimum followers, account age, trust score</li>
        <li>• Choose your objective — distribution, views, reach, engagement, or quality performance</li>
        <li>• Fund transparently — see the exact platform fee up front</li>
        <li>• Track results in real time on your brand dashboard</li>
      </ul>

      <Link href="/signup?as=brand" className="mt-8 inline-block">
        <Button size="lg">Start as a Brand</Button>
      </Link>
    </main>
  );
}
