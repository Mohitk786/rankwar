import Link from "next/link";
import { Compass, LayoutGrid, Trophy } from "lucide-react";
import {
  getCategoryShortName,
  getCategoryVisual,
} from "@/lib/category-visuals";
import { cn } from "@/lib/utils";

export function BoardFilters({
  categories,
  activeSlug,
  period,
}: {
  categories: { slug: string; name: string }[];
  activeSlug?: string;
  period: "all-time" | "today";
}) {
  const allTimeHref = activeSlug ? `/category/${activeSlug}` : "/";
  const todayHref = activeSlug
    ? `/category/${activeSlug}?board=today`
    : "/today";
  const allHref = period === "today" ? "/today" : "/";

  return (
    <div className="mb-6 flex items-center gap-2">
      <div className="relative min-w-0 flex-1 rounded-full bg-muted/80 p-1">
        <div className="flex items-center gap-0.5 overflow-x-auto pr-32 scrollbar-none">
          <Link
            href={allHref}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              !activeSlug
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.5} />
            All
          </Link>
          {categories.map((category) => {
            const { icon: Icon } = getCategoryVisual(category.slug);
            const isActive = activeSlug === category.slug;
            const href =
              period === "today"
                ? `/category/${category.slug}?board=today`
                : `/category/${category.slug}`;

            return (
              <Link
                key={category.slug}
                href={href}
                title={category.name}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                {getCategoryShortName(category.slug, category.name)}
              </Link>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center rounded-r-full">
          <div className="h-full w-14 bg-linear-to-l from-muted to-transparent" />
          <div className="flex h-full items-center rounded-r-full bg-muted py-1 pr-1 pl-1">
            <Link
              href="/categories"
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-foreground/8 px-3 py-2 text-sm font-medium text-foreground ring-1 ring-foreground/10 transition-colors hover:bg-foreground/12"
            >
              <Compass className="h-3.5 w-3.5" strokeWidth={2.5} />
              Explore
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-muted/80 p-1">
          <Link
            href={allTimeHref}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              period === "all-time"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Trophy className="h-3.5 w-3.5" strokeWidth={2.5} />
            All-time
          </Link>
          <Link
            href={todayHref}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              period === "today"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                period === "today" ? "bg-foreground" : "bg-muted-foreground/70",
              )}
            />
            Today
          </Link>
        </div>
      </div>
    </div>
  );
}
