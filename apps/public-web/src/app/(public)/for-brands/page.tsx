import Link from "next/link";
import { Button, StatCard } from "@clip/ui";
import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { CampaignMockup, AnalyticsMockup } from "../../../components/mockups";
import { IconArrowRight, IconLayers, IconTarget, IconWallet, IconChart, IconShield } from "../../../components/icons";

// /for-brands — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
export default function ForBrandsPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100 via-white to-white"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">For brands</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Reach creators, pay for real performance
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Launch a campaign, set your budget and requirements, and let CLIP&apos;s creator
              network distribute your content — you only pay against qualified, verified
              performance, never raw view counts alone.
            </p>
            <Link href="/signup?as=brand" className="mt-8 inline-block">
              <Button size="lg">
                Start as a Brand
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CampaignMockup />
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading title="Everything you need to run a campaign with confidence" />
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            <FeatureRow
              icon={<IconTarget className="h-5 w-5" />}
              title="Set eligibility requirements"
              description="Minimum followers, account age, or trust score — you decide who can accept your campaign."
            />
            <FeatureRow
              icon={<IconLayers className="h-5 w-5" />}
              title="Choose your objective"
              description="Distribution, views, reach, engagement, or qualified performance — pick what matters to you."
            />
            <FeatureRow
              icon={<IconWallet className="h-5 w-5" />}
              title="Fund transparently"
              description="See the exact platform fee up front, before you commit a single rupee. Budget is escrowed on launch."
            />
            <FeatureRow
              icon={<IconChart className="h-5 w-5" />}
              title="Track results in real time"
              description="A live dashboard shows spend, reach, and qualified performance as the campaign runs."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Verified, not vanity"
              description="Every metric is checked against the official Instagram API — you never pay for inflated numbers."
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <AnalyticsMockup />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading align="left" title="Know exactly what you're paying for" />
            <p className="mt-4 text-slate-600">
              Every campaign closes with a full results report — reach, engagement, qualified vs.
              raw performance, and a per-creator breakdown.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <StatCard label="Avg. qualification rate" value="88%" />
              <StatCard label="Cost per qualified view" value="₹0.08" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink">Launch your first campaign today</h2>
        <Link href="/signup?as=brand" className="mt-6 inline-block">
          <Button size="lg">Start as a Brand</Button>
        </Link>
      </section>
    </main>
  );
}
