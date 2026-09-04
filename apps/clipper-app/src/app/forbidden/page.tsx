// 403 fallback — see docs/ui-ux/ERROR_STATES.md "Permission denied" and
// docs/users/AUTHENTICATION_FLOW.md "Unauthorized cross-app access".
export default function ForbiddenPage() {
  const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "http://localhost:3000";
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">This app is for clippers</h1>
      <p className="mt-2 text-slate-500">
        Your account doesn&apos;t have access to clipper.domain.in. If you meant to sign in as a
        brand or admin, use the correct app.
      </p>
      <a href={publicUrl} className="mt-6 text-brand-600 hover:underline">
        Back to Vidlix
      </a>
    </main>
  );
}
