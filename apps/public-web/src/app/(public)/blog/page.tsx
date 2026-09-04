// /blog — honest placeholder, no fabricated posts.
export default function BlogPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Blog</h1>
      <p className="mt-4 text-slate-400">
        Nothing published here yet — check back soon, or see <a href="/how-it-works" className="text-white underline hover:no-underline">How it works</a> for
        the full product walkthrough in the meantime.
      </p>
    </main>
  );
}
