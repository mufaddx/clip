import { Logo } from "../../components/site-header";

// Auth pages carry the same dark identity as the homepage splash (see
// app/page.tsx) rather than the light marketing-site chrome — a user
// arrives here straight from the dark "Brand / Clipper" screen, so
// dropping to a plain white page mid-flow read as broken, not clean.
// Header is logo-only (no marketing nav) to keep the signup/login flow
// free of distractions — see docs/users/ONBOARDING_FLOW.md.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.14),_transparent_55%)]"
      />
      <header className="relative z-10 border-b border-white/10 px-6 py-5 sm:px-10">
        <Logo dark />
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">{children}</div>
    </div>
  );
}
