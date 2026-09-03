// See docs/users/ONBOARDING_FLOW.md "Brand onboarding steps". Full 5-step
// wizard (Account Details, Organization Details, Industry and Category,
// Team Setup, Review) lands in a later session.
export default function BrandOnboardingPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Let&apos;s set up your brand</h1>
      <p className="mt-2 text-slate-500">
        The onboarding wizard (account, organization, industry, team, review) is coming next.
      </p>
    </main>
  );
}
