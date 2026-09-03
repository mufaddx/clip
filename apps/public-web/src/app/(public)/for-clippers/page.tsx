import Link from "next/link";
import { StatCard } from "@clip/ui";
import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { CreatorListMockup, AnalyticsMockup } from "../../../components/mockups";
import { IconLink, IconShield, IconWallet, IconInstagram, IconClock } from "../../../components/icons";

// /for-clippers — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
export default function ForClippersPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-success-600">For clippers</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get paid for content that performs
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-400">
              Connect your Instagram account, accept campaigns that fit your audience, publish,
              and earn based on verified qualified performance — tracked transparently, paid out
              reliably.
            </p>
            <Link
              href="/signup?as=clipper"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md border border-white/15 px-6 text-base font-semibold text-white transition-colors hover:bg-white/5"
            >
              <IconInstagram className="h-4 w-4" />
              Join as a Clipper
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CreatorListMockup />
          </div>
        </div>
      </section>

      <section className="bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading title="Everything you need to earn reliably" />
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            <FeatureRow
              icon={<IconLink className="h-5 w-5" />}
              title="Matched to your content"
              description="Campaigns are filtered by your account's categories and past performance — no cold searching."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Every metric is verifiable"
              description="Traced back to an official Instagram API snapshot — no self-reported numbers, ever."
            />
            <FeatureRow
              icon={<IconClock className="h-5 w-5" />}
              title="Clear verification windows"
              description="Know exactly when a campaign's performance locks in and your earnings move to Available."
            />
            <FeatureRow
              icon={<IconWallet className="h-5 w-5" />}
              title="Withdraw from your wallet"
              description="Once earnings settle, withdraw straight to your linked bank account through Razorpay."
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" title="See your earnings grow, campaign by campaign" />
            <p className="mt-4 text-slate-400">
              Your dashboard tracks every campaign you&apos;ve accepted — status, qualified
              performance, and exactly what you&apos;ve earned.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <StatCard label="Avg. account trust score" value="91 / 100" />
              <StatCard label="Reels verified weekly" value="12K+" />
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AnalyticsMockup />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Connect your account and start earning</h2>
        <Link
          href="/signup?as=clipper"
          className="mt-6 inline-flex h-12 items-center rounded-md border border-white/15 px-6 text-base font-semibold text-white transition-colors hover:bg-white/5"
        >
          Join as a Clipper
        </Link>
      </section>
    </main>
  );
}
