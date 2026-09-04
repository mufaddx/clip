import Link from "next/link";
import { IconInstagram, IconMegaphone } from "../components/icons";
import { HeroParticles } from "../components/hero-particles";
import { SiteFooter } from "../components/site-footer";

// The home page is a deliberate minimal "gate" screen for the hero itself —
// not the full marketing site (that lives at /for-brands, /for-clippers,
// /pricing, etc., under the (public) route group and its own header/footer).
// This is why it's app/page.tsx at the root rather than (public)/page.tsx.
// It still ends in the same SiteFooter as every other page, though, so the
// full set of product/company/legal/payments links is always one scroll
// away rather than missing entirely on the very first page a visitor sees.
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
        <HeroParticles />

        <div className="relative z-10 flex flex-col items-center">
          {/* Meta's own mark — not "Verified by Meta" (that would misrepresent
              standard Instagram API app review as a formal Meta endorsement
              this platform doesn't have). This just factually names the
              technology Instagram integration is built on, the same pattern
              as any "Powered by Stripe" style badge. */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-400">
            <img src="/meta-icon.png" alt="Meta" className="h-3.5 w-3.5" />
            Powered by Meta&apos;s Instagram API
          </span>

          <img
            src="/logo-wordmark-white.png"
            alt="Vidlix"
            className="mt-6 h-[60px] w-auto sm:h-[75px] md:h-[90px]"
          />
          <p className="mt-4 max-w-sm text-sm text-slate-400 sm:text-base">
            Creator distribution, paid on real performance.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup?as=brand"
              className="group flex w-64 items-center gap-3 rounded-lg border border-white/15 px-5 py-4 text-left transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                <IconMegaphone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">Brand</span>
                <span className="block text-xs text-slate-400">Fund a campaign</span>
              </span>
            </Link>

            <Link
              href="/signup?as=clipper"
              className="group flex w-64 items-center gap-3 rounded-lg border border-white/15 px-5 py-4 text-left transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                <IconInstagram className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">Clipper</span>
                <span className="block text-xs text-slate-400">Get paid to publish</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
