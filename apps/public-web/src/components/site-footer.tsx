import Link from "next/link";
import { Logo } from "./site-header";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-brands", label: "For brands" },
      { href: "/for-clippers", label: "For clippers" },
      { href: "/categories", label: "Categories" },
      { href: "/pricing", label: "Pricing" },
      { href: "/payments", label: "Payments & payouts" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press & media" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund-policy", label: "Refund & cancellation policy" },
      { href: "/cookie-policy", label: "Cookie policy" },
      { href: "/acceptable-use", label: "Acceptable use" },
      { href: "/grievance-officer", label: "Grievance officer" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/referral-program", label: "Referral program" },
      { href: "/trust-safety", label: "Trust & safety" },
      { href: "/security", label: "Security" },
      { href: "/instagram-integration", label: "Instagram integration" },
      { href: "/landing-page", label: "Platform overview" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
];

// A factual technology-attribution badge — never "Verified by Meta" or
// "Meta Verified": this platform has standard Instagram API app review,
// not a formal Meta business verification/endorsement, and claiming the
// latter would misrepresent that relationship. Same reasoning as the
// homepage badge in app/page.tsx — kept identical wording for consistency.
function AttributionBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-400">
        <img src="/meta-icon.png" alt="Meta" className="h-3 w-3" />
        Powered by Meta&apos;s Instagram API
      </span>
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-400">
        Payments secured by Razorpay
      </span>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              The distribution layer between brands and the creators who publish for them —
              paid on verified, qualified performance.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <AttributionBadges />
          <div className="flex flex-col items-center gap-1 text-center sm:items-end sm:text-right">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Vidlix. All rights reserved.</p>
            <p className="text-xs text-slate-600">Made for brands and creators, everywhere.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
