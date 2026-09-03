import Link from "next/link";
import { Badge, Button, Card, StatCard } from "@clip/ui";
import { SectionHeading } from "../../components/section-heading";
import { FeatureRow } from "../../components/feature-row";
import { CampaignMockup, AnalyticsMockup, CreatorListMockup } from "../../components/mockups";
import {
  IconArrowRight,
  IconCheckCircle,
  IconChart,
  IconClock,
  IconGift,
  IconInstagram,
  IconLayers,
  IconLink,
  IconLock,
  IconMegaphone,
  IconShield,
  IconSparkle,
  IconTarget,
  IconUsers,
  IconWallet,
} from "../../components/icons";

// Home page — see docs/ui-ux/PAGE_SPECIFICATIONS.md "/" for the full
// required section list. All twelve sections are implemented below in the
// documented order; visuals are CSS/SVG mockups (no stock photography or
// screenshots — see the landing-page design direction agreed for this pass).

function StepList({
  steps,
  accent,
}: {
  steps: string[];
  accent: "brand" | "success";
}) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={step} className="flex items-start gap-3">
          <span
            className={
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
              (accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-success-50 text-success-700")
            }
          >
            {i + 1}
          </span>
          <span className="pt-0.5 text-sm text-slate-600">{step}</span>
        </li>
      ))}
    </ol>
  );
}

const FEATURE_ICON_CLASS = "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "How is a \"view\" verified?",
    a: "Every metric CLIP reports is pulled directly from the official Instagram Graph API for the connected account — never scraped or self-reported. A view only counts toward a campaign once it passes the qualification rules the brand set (minimum watch time, no bot-pattern spikes, matching required mentions/hashtags).",
  },
  {
    q: "What does CLIP charge?",
    a: "A single, transparent platform fee shown up front on every campaign — no hidden deductions. Brands see the exact fee before funding; clippers see their exact payout rate before accepting a campaign.",
  },
  {
    q: "How and when do clippers get paid?",
    a: "Earnings move from Pending to Available once a campaign's verification window closes, then sit in your CLIP wallet ready to withdraw. Payouts go out through Razorpay to your linked bank account.",
  },
  {
    q: "Which accounts are eligible?",
    a: "Any Instagram creator or business account can connect. Individual campaigns can set their own eligibility bar — minimum followers, account age, or trust score — so you'll only see campaigns you actually qualify for.",
  },
  {
    q: "What happens if my content gets rejected?",
    a: "You'll see the exact reason (didn't meet publishing rules, missing required mention/hashtag, etc.) and can resubmit within the campaign's window. Every decision is logged so brands and clippers both see the same record.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ————————————————————— Hero ————————————————————— */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100 via-white to-white"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2">
          <div>
            <Badge variant="info" className="mb-5">
              Now onboarding brands &amp; creators
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Turn creators into your distribution network
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              CLIP connects brands with a network of creators who publish approved content and get
              paid on verified, qualified performance — not vanity views.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup?as=brand">
                <Button size="lg">
                  Start as a Brand
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup?as=clipper">
                <Button size="lg" variant="secondary">
                  Join as a Clipper
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <IconCheckCircle className="h-4 w-4 text-success-600" /> Official Instagram API verification
              </span>
              <span className="flex items-center gap-2">
                <IconCheckCircle className="h-4 w-4 text-success-600" /> Transparent platform fee
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <CampaignMockup />
          </div>
        </div>
      </section>

      {/* ————————————————————— How CLIP Works ————————————————————— */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="How it works"
          title="From campaign to payout, in one flow"
          description="Two sides of the same loop — brands fund and define, creators publish and get paid."
        />
        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          <Card className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className={FEATURE_ICON_CLASS}>
                <IconMegaphone className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-ink">For Brands</h3>
            </div>
            <StepList
              accent="brand"
              steps={[
                "Create your account",
                "Create a campaign",
                "Add campaign funding",
                "Define requirements",
                "Launch the campaign",
                "Creators participate",
                "Performance is tracked",
                "Results are delivered",
              ]}
            />
          </Card>
          <Card className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-700">
                <IconInstagram className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-ink">For Clippers</h3>
            </div>
            <StepList
              accent="success"
              steps={[
                "Create your account",
                "Complete your profile",
                "Connect an eligible account",
                "Discover campaigns",
                "Accept a campaign",
                "Publish approved content",
                "Submit for verification",
                "Earnings are calculated",
                "Withdraw earnings",
              ]}
            />
          </Card>
        </div>
      </section>

      {/* ————————————————————— For Brands ————————————————————— */}
      <section className="bg-slate-50/70 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="For brands"
              title="Reach creators, pay for real performance"
            />
            <p className="mt-4 text-slate-600">
              Launch a campaign, set your budget and requirements, and let CLIP&apos;s creator
              network distribute your content — you only pay against qualified, verified
              performance, never raw view counts alone.
            </p>
            <div className="mt-8 space-y-6">
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
                description="See the exact platform fee up front, before you commit a single rupee."
              />
            </div>
            <Link href="/signup?as=brand" className="mt-8 inline-block">
              <Button size="lg">Start as a Brand</Button>
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CreatorListMockup />
          </div>
        </div>
      </section>

      {/* ————————————————————— For Clippers ————————————————————— */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <AnalyticsMockup />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="For clippers"
              title="Get paid for content that performs"
            />
            <p className="mt-4 text-slate-600">
              Connect your Instagram account, accept campaigns that fit your audience, publish,
              and earn based on verified qualified performance — tracked transparently, paid out
              reliably.
            </p>
            <div className="mt-8 space-y-6">
              <FeatureRow
                icon={<IconLink className="h-5 w-5" />}
                title="Matched to your content"
                description="Campaigns are filtered by your account's categories and past performance."
              />
              <FeatureRow
                icon={<IconShield className="h-5 w-5" />}
                title="Every metric is verifiable"
                description="Traced back to an official Instagram API snapshot — no self-reported numbers."
              />
              <FeatureRow
                icon={<IconWallet className="h-5 w-5" />}
                title="Withdraw straight from your wallet"
                description="Earnings move from Pending to Available once verification closes, then it's yours."
              />
            </div>
            <Link href="/signup?as=clipper" className="mt-8 inline-block">
              <Button size="lg" variant="secondary">
                Join as a Clipper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ————————————————————— Campaign Workflow ————————————————————— */}
      <section className="bg-ink py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Campaign workflow"
            title="One campaign, four stages"
            description="Every campaign — regardless of objective — moves through the same accountable lifecycle."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Create & fund", desc: "Define the objective, requirements, and budget — then lock the funds in escrow." },
              { step: "02", title: "Launch & match", desc: "Eligible creators discover the campaign and accept the ones that fit." },
              { step: "03", title: "Publish & verify", desc: "Creators publish, CLIP verifies every metric against the Instagram API." },
              { step: "04", title: "Pay & report", desc: "Qualified performance settles automatically; brands get a full results report." },
            ].map((s) => (
              <div key={s.step} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-mono font-semibold text-brand-300">{s.step}</p>
                <p className="mt-3 font-semibold text-white">{s.title}</p>
                <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ————————————————————— Performance Tracking ————————————————————— */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Performance tracking" title="Qualified performance, not vanity metrics" />
            <p className="mt-4 text-slate-600">
              Raw view counts are easy to fake. CLIP tracks every reel against the official
              Instagram Graph API, applies each campaign&apos;s qualification rules, and only pays
              out on what actually clears the bar.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <StatCard label="Views verified daily" value="4.2M+" />
              <StatCard label="Avg. qualification rate" value="88%" trend={{ direction: "up", label: "vs. raw views" }} />
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AnalyticsMockup />
          </div>
        </div>
      </section>

      {/* ————————————————————— Creator Network ————————————————————— */}
      <section className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Creator network"
            title="A network built for discovery"
            description="Campaigns are matched to creators by category, audience, and track record — not first-come-first-served."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            <StatCard label="Content categories" value="18" />
            <StatCard label="Avg. account trust score" value="91 / 100" />
            <StatCard label="Reels verified per week" value="12K+" />
          </div>
        </div>
      </section>

      {/* ————————————————————— Analytics Preview ————————————————————— */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="flex justify-center lg:justify-start">
            <CampaignMockup />
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Analytics" title="Every number, live and exportable" />
            <p className="mt-4 text-slate-600">
              Brands get a real-time dashboard — spend, reach, qualified vs. raw performance,
              per-creator breakdowns — plus an exportable report at campaign close.
            </p>
            <div className="mt-8 space-y-6">
              <FeatureRow
                icon={<IconChart className="h-5 w-5" />}
                title="Live campaign dashboard"
                description="Budget spent, qualified reach, and active-creator counts update as they happen."
              />
              <FeatureRow
                icon={<IconClock className="h-5 w-5" />}
                title="Historical trends"
                description="Compare campaigns over time to see what objectives and creators perform best."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ————————————————————— Referral Program ————————————————————— */}
      <section className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 rounded-2xl bg-white p-10 shadow-md lg:grid-cols-2">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <IconGift className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink">
                Invite creators, earn from their success
              </h2>
              <p className="mt-3 text-slate-600">
                Share your referral link. When someone joins CLIP and starts earning, you earn a
                reward too — tracked automatically, no manual claims.
              </p>
              <Link href="/signup?as=clipper" className="mt-6 inline-block">
                <Button size="lg" variant="secondary">
                  Get your referral link
                </Button>
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-medium text-slate-400">Your referral link</p>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
                <span className="truncate text-sm text-slate-600">vidlix.in/r/yourhandle</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white p-3">
                  <p className="text-[11px] text-slate-400">Referrals joined</p>
                  <p className="mt-1 text-lg font-semibold text-ink">23</p>
                </div>
                <div className="rounded-md bg-white p-3">
                  <p className="text-[11px] text-slate-400">Rewards earned</p>
                  <p className="mt-1 text-lg font-semibold text-ink">₹4,650</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ————————————————————— Security & Trust ————————————————————— */}
      <section className="bg-ink py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Security & trust"
            title="Built to be verifiable, end to end"
            description="Every claim CLIP makes about performance is backed by how the system is actually built."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <IconShield className="h-5 w-5" />, title: "Official API only", desc: "Metrics come from Instagram's Graph API — never scraped or self-reported." },
              { icon: <IconLock className="h-5 w-5" />, title: "Encrypted tokens", desc: "Instagram access tokens are encrypted at rest and never exposed to either side." },
              { icon: <IconWallet className="h-5 w-5" />, title: "Escrowed funds", desc: "Campaign budgets are locked before launch — creators are always paid for qualified work." },
              { icon: <IconSparkle className="h-5 w-5" />, title: "Fraud detection", desc: "Suspicious activity patterns are flagged and reviewed before payout, not after." },
            ].map((f) => (
              <div key={f.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                  {f.icon}
                </span>
                <p className="mt-4 font-semibold text-white">{f.title}</p>
                <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ————————————————————— FAQ ————————————————————— */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <div className="mt-10 divide-y divide-slate-200">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                {item.q}
                <IconArrowRight className="h-4 w-4 shrink-0 rotate-90 text-slate-400 transition-transform group-open:rotate-[270deg]" />
              </summary>
              <p className="mt-3 text-sm text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ————————————————————— Final CTA ————————————————————— */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),_transparent_60%)]"
          />
          <IconUsers className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to put your content to work?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Whether you&apos;re funding distribution or creating it, CLIP settles on verified
            performance — not promises.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup?as=brand"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-base font-semibold text-brand-700 transition-colors hover:bg-slate-100"
            >
              Start as a Brand
            </Link>
            <Link
              href="/signup?as=clipper"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Join as a Clipper
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
