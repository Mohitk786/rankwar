import Link from "next/link";
import { Flame } from "lucide-react";
import { getAllCategoriesWithTop3, getMostActiveCategories } from "@/lib/ranking";
import { formatUsd } from "@/lib/format";
import { getCategoryVisual, categoryTagStyle } from "@/lib/category-visuals";

export const metadata = { title: "Categories" };
export const revalidate = 30;

export default async function CategoriesPage() {
  const [all, mostActive] = await Promise.all([getAllCategoriesWithTop3(), getMostActiveCategories(6)]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 font-mono text-2xl font-bold">Categories</h1>
      <p className="mb-6 text-sm text-muted">
        Each category is its own board — a much cheaper #1 than the all-time overall top spot.
      </p>

      {mostActive.some((c) => c.recentActivity > 0) ? (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted">
            <Flame className="h-4 w-4 text-accent" strokeWidth={2.5} /> Most active this week
          </h2>
          <div className="flex flex-wrap gap-2">
            {mostActive
              .filter((c) => c.recentActivity > 0)
              .map((c) => {
                const { icon: Icon } = getCategoryVisual(c.slug);
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-sm text-accent"
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {c.name} · {c.recentActivity}
                  </Link>
                );
              })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {all.map(({ category, top, totalCount }) => {
          const { icon: Icon } = getCategoryVisual(category.slug);
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="rounded-lg border border-border p-4 transition-colors hover:border-accent/50 hover:shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 font-semibold">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={categoryTagStyle(category.slug)}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{totalCount} listed</span>
              </div>
              {top.length === 0 ? (
                <p className="text-sm text-muted">No listings yet — be the first.</p>
              ) : (
                <ol className="space-y-1 text-sm">
                  {top.map((listing, i) => (
                    <li key={listing.id} className="flex justify-between gap-2">
                      <span className="truncate text-muted">
                        {i + 1}. {listing.displayName}
                      </span>
                      <span className="shrink-0 font-mono text-accent">{formatUsd(listing.currentAmount)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
