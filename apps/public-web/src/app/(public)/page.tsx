import Link from "next/link";
import { Button } from "@clip/ui";

// Home page — see docs/ui-ux/PAGE_SPECIFICATIONS.md "/" for the full section list.
// This first pass implements Hero + How It Works; the remaining marketing
// sections (For Brands, For Clippers, Campaign Workflow, Performance Tracking,
// Creator Network, Analytics Preview, Referral Program, Security & Trust, FAQ,
// final CTA, Footer) land in a later session.
export default function HomePage() {
  return (
    <main>
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Turn creators into your distribution network
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          CLIP connects brands with a network of creators who publish approved content and get
          paid on verified, qualified performance — not vanity views.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup?as=brand">
            <Button size="lg">Start as a Brand</Button>
          </Link>
          <Link href="/signup?as=clipper">
            <Button size="lg" variant="secondary">
              Join as a Clipper
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-ink">How CLIP works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">For Brands</h3>
            <ol className="mt-3 space-y-1 text-sm text-slate-600">
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
            <h3 className="font-semibold text-ink">For Clippers</h3>
            <ol className="mt-3 space-y-1 text-sm text-slate-600">
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
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <nav className="mb-4 flex flex-wrap justify-center gap-4">
          <Link href="/about" className="hover:text-slate-600">About</Link>
          <Link href="/how-it-works" className="hover:text-slate-600">How It Works</Link>
          <Link href="/for-brands" className="hover:text-slate-600">For Brands</Link>
          <Link href="/for-clippers" className="hover:text-slate-600">For Clippers</Link>
          <Link href="/categories" className="hover:text-slate-600">Categories</Link>
          <Link href="/pricing" className="hover:text-slate-600">Pricing</Link>
          <Link href="/faq" className="hover:text-slate-600">FAQ</Link>
          <Link href="/contact" className="hover:text-slate-600">Contact</Link>
          <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-600">Terms</Link>
        </nav>
        © {new Date().getFullYear()} CLIP
      </footer>
    </main>
  );
}
