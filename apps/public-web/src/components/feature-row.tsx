import type { ReactNode } from "react";

export function FeatureRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
