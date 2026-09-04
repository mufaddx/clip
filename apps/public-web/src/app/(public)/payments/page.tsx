import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { IconWallet, IconLock, IconClock, IconShield } from "../../../components/icons";

// /payments — how funding, the creator wallet, and payouts actually work.
// Linked from the footer so brands and clippers can see the full money
// flow in one place instead of it being scattered across /pricing,
// /for-brands, and /for-clippers. See docs/finance/PAYMENT_SYSTEM.md and
// docs/finance/WITHDRAWAL_SYSTEM.md for the underlying implementation.
export default function PaymentsPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <SectionHeading
          eyebrow="Payments"
          title="How funding, wallets, and payouts work"
          description="One transparent money flow — from a brand funding a campaign to a clipper withdrawing what they earned."
        />
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-xl font-semibold text-white">Brand side — funding a campaign</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <FeatureRow
              icon={<IconWallet className="h-5 w-5" />}
              title="Payment gateway: Razorpay"
              description="Campaign budgets are funded through Razorpay's secure checkout — cards, UPI, netbanking, and wallets. Vidlix never stores your card details."
            />
            <FeatureRow
              icon={<IconLock className="h-5 w-5" />}
              title="Recognized only after confirmation"
              description="A deposit is only added to your balance once Razorpay confirms the payment via a signed webhook — never on the checkout screen alone. This protects you from double-charges or spoofed success screens."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Platform fee shown up front"
              description="A transparent 15% platform fee (admin-configurable) is added on top of the creator budget before you fund anything — see /pricing for a worked example."
            />
            <FeatureRow
              icon={<IconClock className="h-5 w-5" />}
              title="Escrowed for the campaign"
              description="Funded budget is reserved against that campaign until it's spent on qualified clipper performance or the campaign is closed."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-xl font-semibold text-white">Clipper side — wallet &amp; payouts</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <FeatureRow
              icon={<IconWallet className="h-5 w-5" />}
              title="Earnings post to your wallet"
              description="Once a campaign's verification window closes, your calculated earnings are credited to your Vidlix wallet — visible on your dashboard immediately."
            />
            <FeatureRow
              icon={<IconClock className="h-5 w-5" />}
              title="Your balance never expires"
              description="Wallet balance simply sits there, yours, for as long as you don't withdraw it — there's no expiry, no minimum-activity requirement to keep it, and no fee for holding it."
            />
            <FeatureRow
              icon={<IconLock className="h-5 w-5" />}
              title="Withdraw to your bank anytime"
              description="Request a withdrawal and Vidlix pays it out to your linked bank account via RazorpayX — you keep 100% of your calculated earnings, the platform fee is charged to the brand, never deducted from your payout."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Full ledger, always visible"
              description="Every credit and debit — campaign earnings, referral rewards, withdrawals — is logged in your wallet history so you always know exactly where a rupee came from."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-semibold text-white">Security</h2>
          <p className="mt-3 text-sm text-slate-400">
            Every payment event is verified with an HMAC-SHA256 signature check against Razorpay&apos;s
            webhook before it touches a wallet — Vidlix never accepts an unverified success callback
            as proof of payment. See our <a href="/refund-policy" className="text-white underline hover:no-underline">Refund Policy</a> for
            how disputed or failed deposits are handled.
          </p>
        </div>
      </section>
    </main>
  );
}
