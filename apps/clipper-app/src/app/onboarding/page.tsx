// Onboarding wizard stub — see docs/users/ONBOARDING_FLOW.md "Clipper
// onboarding steps". The full 5-step wizard (Basic Profile, Content
// Categories, Creator Preferences, Instagram Connection, Review) lands in a
// later session; this placeholder keeps the auth→onboarding redirect real.
export default function ClipperOnboardingPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Let&apos;s set up your creator profile</h1>
      <p className="mt-2 text-slate-500">
        The onboarding wizard (profile, categories, preferences, Instagram connection, review) is
        coming next.
      </p>
    </main>
  );
}
