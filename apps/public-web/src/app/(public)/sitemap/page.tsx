import Link from "next/link";

// /sitemap — a plain human-readable page list, mirroring the footer's
// groups. (This is the readable sitemap for visitors, not the machine
// sitemap.xml search engines use — that's a separate, unrelated file.)
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Get started",
    links: [
      { href: "/", label: "Home" },
      { href: "/login", label: "Log in" },
      { href: "/signup?as=brand", label: "Sign up as a brand" },
      { href: "/signup?as=clipper", label: "Sign up as a clipper" },
    ],
  },
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
      { href: "/acceptable-use", label: "Acceptable use & community guidelines" },
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

export default function SitemapPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Sitemap</h1>
      <p className="mt-4 text-slate-400">Every page on vidlix.in, in one place.</p>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-white">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
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
    </main>
  );
}
