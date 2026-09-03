import { Logo } from "../../components/site-header";

// Auth pages share the site-wide dark background (mounted once in the root
// layout — see components/dark-backdrop.tsx). Header is logo-only (no
// marketing nav) to keep the signup/login flow free of distractions — see
// docs/users/ONBOARDING_FLOW.md.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 px-6 py-5 sm:px-10">
        <Logo />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-16">{children}</div>
    </div>
  );
}
