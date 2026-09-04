import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { IconLock, IconShield, IconClock } from "../../../components/icons";

// /security — factual, describes the real mechanisms in the codebase
// (argon2 password hashing in AuthService, JWT access + rotated refresh
// tokens in packages/utilities/session.ts, Razorpay webhook HMAC
// verification in PaymentsController). No claims of a formal audit or
// certification that hasn't actually happened.
export default function SecurityPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <SectionHeading
          eyebrow="Security"
          title="How Vidlix protects your account and your money"
        />
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <FeatureRow
              icon={<IconLock className="h-5 w-5" />}
              title="Passwords are hashed, never stored plain"
              description="Every password is hashed with Argon2 before it touches the database — Vidlix itself can't read your password back, even internally."
            />
            <FeatureRow
              icon={<IconClock className="h-5 w-5" />}
              title="Short-lived sessions, rotating refresh tokens"
              description="Sign-in sessions use a short-lived access token plus a single-use, rotating refresh token — a stolen or replayed refresh token stops working the moment it's used once."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Payments verified by signature, not by trust"
              description="Every Razorpay payment event is checked with an HMAC-SHA256 signature before it's accepted — a spoofed or tampered webhook is rejected outright, never credited to a wallet."
            />
            <FeatureRow
              icon={<IconLock className="h-5 w-5" />}
              title="Role-scoped access"
              description="Brand, clipper, and admin roles each see and can act on only what their role permits — enforced on every request, not just hidden in the UI."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm text-slate-400">
            Found a security issue? Please report it via <a href="/contact" className="text-white underline hover:no-underline">Contact</a> rather
            than a public channel — we&apos;ll respond directly.
          </p>
        </div>
      </section>
    </main>
  );
}
