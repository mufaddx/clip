// /contact — see docs/ui-ux/PAGE_SPECIFICATIONS.md. A logged-in support
// ticket flow already exists (clipper.domain.in/support,
// brand.domain.in/support); this page is for pre-signup visitors, so it
// points to email rather than faking a form against a backend that
// requires an authenticated user (support_tickets.userId is required —
// see docs/database/DATABASE_SCHEMA.md).
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-ink">Contact us</h1>
      <p className="mt-4 text-slate-600">
        Already have an account? Open a support ticket from your dashboard for the fastest
        response. Otherwise, reach us at{" "}
        <a href="mailto:hello@vidlix.in" className="text-brand-600 hover:underline">hello@vidlix.in</a>.
      </p>
    </main>
  );
}
