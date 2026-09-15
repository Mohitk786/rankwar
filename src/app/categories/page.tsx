import Link from "next/link";
import { Flame } from "lucide-react";
import {
  getAllCategoriesWithTop3,
  getMostActiveCategories,
} from "@/lib/ranking";
import { formatUsd } from "@/lib/format";
import { getCategoryVisual } from "@/lib/category-visuals";
import { ScallopStrip } from "@/components/ScallopStrip";
import { ListingFavicon } from "@/components/ListingFavicon";
import { PageShell } from "@/components/PageShell";
import { chunk } from "@/lib/utils";

export const metadata = { title: "Categories" };
export const revalidate = 30;

export default async function CategoriesPage() {
  const [all, mostActive] = await Promise.all([
    getAllCategoriesWithTop3(),
    getMostActiveCategories(6),
  ]);
  const activeThisWeek = mostActive.filter((c) => c.recentActivity > 0);

  return (
    <PageShell>
      <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight">
        Categories
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Each category is its own board — a much cheaper #1 than the all-time
        overall top spot.
      </p>

      {activeThisWeek.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Flame className="h-4 w-4" strokeWidth={2.5} /> Most active this
            week
          </h2>
          <div className="flex flex-wrap gap-2">
            {activeThisWeek.map((c) => {
              const { icon: Icon } = getCategoryVisual(c.slug);
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
                >
                  <Icon
                    className="h-3.5 w-3.5 text-muted-foreground"
                    strokeWidth={2.5}
                  />
                  {c.name} · {c.recentActivity}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div>
        {chunk(all, 4).map((group, groupIndex, groups) => (
          <div key={groupIndex}>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.map(({ category, top, totalCount }) => {
                const { icon: Icon } = getCategoryVisual(category.slug);
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="overflow-hidden rounded-lg border border-border bg-background transition-colors hover:bg-card"
                  >
                    <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border">
                        <Icon className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-serif font-semibold tracking-tight">
                        {category.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {totalCount} listed
                      </span>
                    </div>
                    <ScallopStrip
                      patternId={`rw-category-${category.slug}-head`}
                    />
                    {top.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground sm:px-4">
                        No listings yet — be the first.
                      </p>
                    ) : (
                      <ol>
                        {top.map((listing, index) => (
                          <li key={listing.id} className="relative">
                            {index > 0 && (
                              <ScallopStrip
                                patternId={`rw-category-${category.slug}-${index}`}
                              />
                            )}
                            <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4">
                              <span className="w-7 shrink-0 text-right font-serif text-sm tabular text-muted-foreground">
                                #{index + 1}
                              </span>
                              <ListingFavicon
                                src={listing.faviconUrl}
                                size={32}
                              />
                              <span className="min-w-0 flex-1 truncate font-medium">
                                {listing.displayName}
                              </span>
                              <span className="shrink-0 font-serif text-sm font-semibold tabular tracking-tight text-primary">
                                {formatUsd(listing.currentAmount)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </Link>
                );
              })}
            </div>
            {groupIndex < groups.length - 1 && (
              <div className="my-10 mx-auto max-w-3/4 border" />
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
