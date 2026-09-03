import { Logo } from "../../components/site-header";

// Auth pages get a minimal header (logo only, no marketing nav) — keeping
// the signup/login flow free of distractions, per
// docs/users/ONBOARDING_FLOW.md's "reduce drop-off" guidance.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Logo />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">{children}</div>
    </div>
  );
}
