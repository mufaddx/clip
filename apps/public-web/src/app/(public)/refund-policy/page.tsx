// /refund-policy — placeholder structure; real legal text needs actual legal review before launch.
// Also functions as the merchant-facing refund/cancellation policy Razorpay
// requires to be published on the site — see docs/finance/PAYMENT_SYSTEM.md.
export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Refund &amp; Cancellation Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Placeholder — needs legal review before this reflects real, enforceable terms.</p>

      <div className="mt-8 space-y-6 text-sm text-slate-400">
        <section>
          <h2 className="font-semibold text-white">Campaign funding</h2>
          <p className="mt-1">
            A brand&apos;s deposit is refundable for the unspent portion of a campaign&apos;s budget —
            the part not already earned by clippers for qualified performance. Amounts already
            credited to a clipper&apos;s wallet are final and are not reversed by a brand-side refund.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Failed or duplicate payments</h2>
          <p className="mt-1">
            If Razorpay reports a payment as failed after your account was charged, or a payment is
            captured twice for the same deposit, contact support with your payment reference and
            the amount is reconciled and refunded to your original payment method.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Clipper withdrawals</h2>
          <p className="mt-1">
            Withdrawals are payouts of a clipper&apos;s own earned wallet balance, not purchases, and
            aren&apos;t subject to this refund policy. A withdrawal that fails to reach the linked bank
            account is returned to the wallet automatically so the balance is never lost.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">How to request a refund</h2>
          <p className="mt-1">
            Reach out via the <a href="/contact" className="text-white underline hover:no-underline">Contact</a> page
            with your account email and payment reference — see also our <a href="/payments" className="text-white underline hover:no-underline">Payments</a> page
            for how deposits and payouts work.
          </p>
        </section>
      </div>
    </main>
  );
}
