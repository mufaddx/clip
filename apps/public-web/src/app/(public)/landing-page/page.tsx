import Link from "next/link";
import { Button } from "@clip/ui";
import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { CampaignMockup, CreatorListMockup } from "../../../components/mockups";
import {
  IconArrowRight,
  IconMegaphone,
  IconInstagram,
  IconTarget,
  IconWallet,
  IconShield,
  IconLock,
  IconGift,
} from "../../../components/icons";

// /landing-page — the "More" link from the homepage gate screen (see
// app/page.tsx) points here. This is the one page that ties the whole
// platform together in a single scroll — brand side, clipper side,
// payments, and trust & safety — with links out to each topic's full page
// rather than repeating their detail. Gets the shared SiteHeader/SiteFooter
// automatically from the (public) route group's layout.
export default function LandingOverviewPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <SectionHeading
          eyebrow="Platform overview"
          title="Everything Vidlix does, in one page"
          description="Brands fund campaigns. Clippers publish and get paid on verified performance. Here's the whole loop, end to end."
        />
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/signup?as=brand">
            <Button size="lg">
              Start as a Brand <IconArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href="/signup?as=clipper"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 px-6 text-base font-semibold text-white transition-colors hover:bg-white/5"
          >
            Join as a Clipper <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg border border-white/10 p-6 font-mono text-xs leading-relaxed text-slate-400">
            Brand funds a campaign → Clippers discover &amp; accept it → Clippers publish on
            Instagram → Vidlix tracks performance via the Meta Graph API → Qualified performance is
            calculated → Creator earnings post to their wallet → Brand sees verified results,
            creator withdraws earnings
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            The full step-by-step is on <Link href="/how-it-works" className="text-white underline hover:no-underline">How it works</Link>.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">For brands</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Pay for performance, not promises</h2>
            <div className="mt-6 space-y-6">
              <FeatureRow
                icon={<IconMegaphone className="h-5 w-5" />}
                title="Set your budget per clipper account"
                description="Pick how many accounts you want and Vidlix works out the total budget at the current admin-set rate — no guessing at views."
              />
              <FeatureRow
                icon={<IconTarget className="h-5 w-5" />}
                title="Target the right creators"
                description="Set eligibility by content category and trust score so your campaign reaches the right audience."
              />
              <FeatureRow
                icon={<IconShield className="h-5 w-5" />}
                title="Only pay for verified results"
                description="Performance is checked against the official Instagram API before it counts."
              />
            </div>
            <Link href="/for-brands" className="mt-6 inline-block text-sm text-white underline hover:no-underline">
              Full brand walkthrough →
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CampaignMockup />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
            <CreatorListMockup />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-success-600">For clippers</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Publish approved content, get paid</h2>
            <div className="mt-6 space-y-6">
              <FeatureRow
                icon={<IconInstagram className="h-5 w-5" />}
                title="Connect your Instagram account"
                description="Authorized through Meta's own flow — Vidlix never sees your password."
              />
              <FeatureRow
                icon={<IconTarget className="h-5 w-5" />}
                title="Only see campaigns that fit you"
                description="Matched to your content categories, so you're not scrolling through campaigns you'd never post."
              />
              <FeatureRow
                icon={<IconWallet className="h-5 w-5" />}
                title="Earnings land in your wallet"
                description="Withdraw to your bank account whenever you want — your balance never expires."
              />
            </div>
            <Link href="/for-clippers" className="mt-6 inline-block text-sm text-white underline hover:no-underline">
              Full clipper walkthrough →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading title="Money and trust, handled properly" />
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <FeatureRow
              icon={<IconWallet className="h-5 w-5" />}
              title="Payments & payouts"
              description="Razorpay for funding, RazorpayX for payouts. See exactly how deposits, fees, and withdrawals work."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Trust & safety"
              description="Human-approved campaigns, official API-verified performance, and fraud screening on referrals."
            />
            <FeatureRow
              icon={<IconLock className="h-5 w-5" />}
              title="Security"
              description="Hashed passwords, rotating refresh tokens, and signature-verified payment webhooks."
            />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/payments" className="text-white underline hover:no-underline">Payments & payouts →</Link>
            <Link href="/trust-safety" className="text-white underline hover:no-underline">Trust & safety →</Link>
            <Link href="/security" className="text-white underline hover:no-underline">Security →</Link>
            <Link href="/referral-program" className="text-white underline hover:no-underline">Referral program →</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <IconGift className="mx-auto h-8 w-8 text-brand-500" />
          <h2 className="mt-4 text-2xl font-bold text-white">Not ready to sign up? Explore the whole site</h2>
          <p className="mt-3 text-sm text-slate-400">
            Every page on vidlix.in is listed on the <Link href="/sitemap" className="text-white underline hover:no-underline">Sitemap</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
