// /categories — see docs/database/DATABASE_SCHEMA.md `categories` (seeded in packages/db/prisma/seed.ts).
const CATEGORIES = ["Beauty", "Fashion", "Fitness", "Food", "Gaming", "Tech", "Travel", "Finance", "Comedy", "Lifestyle"];

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Categories</h1>
      <p className="mt-4 text-slate-400">Campaigns and creators are organized by content category to keep matching relevant.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <span key={c} className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-slate-200">{c}</span>
        ))}
      </div>
    </main>
  );
}
