// /privacy — placeholder structure; real legal text needs actual legal review before launch.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Placeholder — needs legal review before this reflects a real, launchable policy.</p>

      <div className="mt-8 space-y-6 text-sm text-slate-400">
        <section>
          <h2 className="font-semibold text-white">What we collect</h2>
          <p className="mt-1">Account details (email, role), campaign and content metadata, Instagram account data authorized via Meta&apos;s official API, and financial records needed to calculate and pay out earnings.</p>
        </section>
        <section>
          <h2 className="font-semibold text-white">How we use it</h2>
          <p className="mt-1">To run the platform: matching campaigns to creators, calculating qualified performance, processing payouts, and preventing fraud.</p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Instagram data</h2>
          <p className="mt-1">Collected only through Meta&apos;s official Graph API with your explicit authorization — never scraped. See docs/architecture/META_INSTAGRAM_INTEGRATION.md for the technical detail.</p>
        </section>
      </div>
    </main>
  );
}
