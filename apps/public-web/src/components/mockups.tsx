import { IconCheckCircle, IconInstagram } from "./icons";

// Pure CSS/SVG "product preview" mockups — no screenshots or external
// images (see landing page design direction: modern illustration/mockup
// style, Stripe/Linear-esque). These are decorative approximations of the
// real dashboards, not literal screenshots, so they can't drift out of
// sync with the actual product UI in a misleading way.

function BrowserChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
      <span className="ml-2 truncate text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

function Bar({ pct, tone }: { pct: number; tone: "brand" | "success" }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={tone === "brand" ? "h-full rounded-full bg-brand-500" : "h-full rounded-full bg-success-600"}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Hero product preview — a campaign performance snapshot. */
export function CampaignMockup() {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <BrowserChrome label="brand.vidlix.in/campaigns/summer-launch" />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Summer Launch</p>
            <p className="text-xs text-slate-400">Qualified performance campaign · Live</p>
          </div>
          <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700">Live</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-400">Qualified views</p>
            <p className="mt-1 text-lg font-semibold text-ink">2.4M</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-400">Active clippers</p>
            <p className="mt-1 text-lg font-semibold text-ink">86</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-400">Budget spent</p>
            <p className="mt-1 text-lg font-semibold text-ink">62%</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Budget used</span>
              <span className="font-medium text-ink">₹1,86,400 / ₹3,00,000</span>
            </div>
            <Bar pct={62} tone="brand" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Verified vs. raw views</span>
              <span className="font-medium text-ink">92% qualified</span>
            </div>
            <Bar pct={92} tone="success" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-3">
          <IconCheckCircle className="h-4 w-4 shrink-0 text-success-600" />
          <p className="text-xs text-slate-500">
            <span className="font-medium text-ink">14 reels</span> verified against the official Instagram API in
            the last hour
          </p>
        </div>
      </div>
    </div>
  );
}

/** Analytics-preview mockup — a bar/line style trend chart. */
export function AnalyticsMockup() {
  const bars = [38, 52, 44, 61, 58, 74, 69, 85, 78, 92, 88, 97];
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <BrowserChrome label="brand.vidlix.in/analytics" />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Qualified performance, last 12 weeks</p>
          <span className="text-xs font-medium text-success-700">▲ 21%</span>
        </div>
        <div className="mt-5 flex h-32 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500 to-brand-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
          <div>
            <p className="text-[11px] text-slate-400">Reach</p>
            <p className="mt-1 text-sm font-semibold text-ink">18.9M</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Engagement rate</p>
            <p className="mt-1 text-sm font-semibold text-ink">6.8%</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Cost / qualified view</p>
            <p className="mt-1 text-sm font-semibold text-ink">₹0.08</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Creator network mockup — connected Instagram accounts list. */
export function CreatorListMockup() {
  const rows = [
    { handle: "@studio.aria", followers: "412K", score: 96 },
    { handle: "@kettlebell.raj", followers: "128K", score: 91 },
    { handle: "@thecityfeed", followers: "780K", score: 88 },
  ];
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <BrowserChrome label="clipper.vidlix.in/campaigns/recommended" />
      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.handle} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <IconInstagram className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{r.handle}</p>
              <p className="text-xs text-slate-400">{r.followers} followers · connected</p>
            </div>
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {r.score} trust
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
