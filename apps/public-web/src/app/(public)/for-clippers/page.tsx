import Link from "next/link";
import { Button } from "@clip/ui";

// /for-clippers — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
export default function ForClippersPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold text-ink">Get paid for content that performs</h1>
      <p className="mt-4 text-slate-600">
        Connect your Instagram account, accept campaigns that fit your audience, publish, and earn
        based on verified qualified performance — tracked transparently, paid out reliably.
      </p>

      <ul className="mt-8 space-y-3 text-sm text-slate-600">
        <li>• Campaigns matched to your content categories and account performance</li>
        <li>• Every metric traces back to an official Instagram API snapshot</li>
        <li>• Earnings move from Pending to Available once verification closes</li>
        <li>• Withdraw straight from your wallet</li>
      </ul>

      <Link href="/signup?as=clipper" className="mt-8 inline-block">
        <Button size="lg" variant="secondary">Join as a Clipper</Button>
      </Link>
    </main>
  );
}
