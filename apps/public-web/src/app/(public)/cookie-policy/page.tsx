// /cookie-policy — placeholder structure; real legal text needs actual legal review before launch.
export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Placeholder — needs legal review before this reflects a real, launchable policy.</p>

      <div className="mt-8 space-y-6 text-sm text-slate-400">
        <section>
          <h2 className="font-semibold text-white">What we set</h2>
          <p className="mt-1">
            Vidlix uses first-party cookies only to keep you signed in — an access-token cookie and a
            refresh-token cookie, scoped to vidlix.in and its subdomains. There is no third-party
            advertising or cross-site tracking cookie on this site.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Why we need them</h2>
          <p className="mt-1">
            Without these cookies you&apos;d have to log in on every page load — they exist purely to
            keep your dashboard session working across brand.vidlix.in, clipper.vidlix.in, and
            admin.vidlix.in.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Your choices</h2>
          <p className="mt-1">
            Blocking these cookies in your browser will sign you out and prevent logging back in —
            they aren&apos;t optional in the way an analytics or ad cookie would be.
          </p>
        </section>
      </div>
    </main>
  );
}
