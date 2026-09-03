import Link from "next/link";
import { IconInstagram, IconMegaphone } from "../components/icons";

// The home page is a deliberate minimal "gate" screen — not the full
// marketing site (that lives at /for-brands, /for-clippers, /pricing,
// etc., under the (public) route group and its header/footer). This is
// why it's app/page.tsx at the root rather than (public)/page.tsx: it
// intentionally opts out of that shared chrome to stay a single,
// uncluttered screen. See docs/ui-ux/PAGE_SPECIFICATIONS.md "/" — the
// informational sections it lists still exist, just one click away
// through the two options below rather than stacked on this screen.
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(99,102,241,0.16),_transparent_60%)]"
      />

      <p className="absolute right-6 top-6 text-xs uppercase tracking-[0.2em] text-slate-500 sm:right-10 sm:top-10">
        Brands × Creators
      </p>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl md:text-8xl">
          VIDLIX
        </h1>
        <p className="mt-4 max-w-sm text-sm text-slate-400 sm:text-base">
          Creator distribution, paid on real performance.
        </p>

        <span aria-hidden className="mt-10 h-10 w-px bg-brand-500" />

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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

        <Link href="/login" className="mt-8 text-xs text-slate-500 hover:text-slate-300">
          Already have an account? <span className="underline">Log in</span>
        </Link>
      </div>

      <p className="absolute bottom-6 text-xs text-slate-600 sm:bottom-10">
        © {new Date().getFullYear()} Vidlix · <Link href="/how-it-works" className="hover:text-slate-400">How it works</Link>
      </p>
    </main>
  );
}
