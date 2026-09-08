import Link from "next/link";
import { formatCount, formatRelativeTime, formatUsd } from "@/lib/format";
import { TAKE_FIRST_PLACE_MARGIN } from "@/lib/pricing";
import { CategoryTag } from "./CategoryTag";

export type BoardRow = {
  id: string;
  slug: string;
  displayName: string;
  description: string | null;
  faviconUrl: string | null;
  amount: number;
  clickCount: number;
  lastPaidAt: Date;
  category: { slug: string; name: string };
};

export function BoardTable({
  rows,
  emptyLabel = "Nothing here yet.",
  isGlobalAllTimeBoard = false,
}: {
  rows: BoardRow[];
  emptyLabel?: string;
  /** Only true for the unfiltered, all-time board — the one place the "+$5 to take #1" rule is actually enforced. */
  isGlobalAllTimeBoard?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted">{emptyLabel}</p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-lg border border-border">
      {rows.map((row, index) => {
        const margin = isGlobalAllTimeBoard && index === 0 ? TAKE_FIRST_PLACE_MARGIN : 1;
        const priceToBeat = row.amount + margin;

        return (
          <li
            key={row.id}
            className="group/row relative transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface"
          >
            {/* Stretched link: clicking anywhere on the row (except "See details") goes straight to the destination — matching a real placement, not an internal detail page. */}
            <a
              href={`/go/${row.slug}`}
              className="absolute inset-0 first:rounded-t-lg last:rounded-b-lg"
              aria-label={`Visit ${row.displayName}`}
              rel="sponsored nofollow"
            />

            {/* Hover hint: what it'd cost to overtake this exact spot. */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover/row:opacity-100"
              aria-hidden
            >
              claim this rank for {formatUsd(priceToBeat)}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
            </div>

            <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
              <span className="w-7 shrink-0 text-right font-mono text-sm tabular text-muted">{index + 1}</span>
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-border">
                {row.faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.faviconUrl} alt="" width={36} height={36} className="h-full w-full object-contain" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="truncate font-medium">{row.displayName}</span>
                  <CategoryTag slug={row.category.slug} name={row.category.name} className="hidden sm:inline-flex" />
                </span>
                {row.description ? <span className="block truncate text-sm text-muted">{row.description}</span> : null}
                <span className="flex items-center gap-1 text-xs text-muted">
                  {formatRelativeTime(row.lastPaidAt)} · {formatCount(row.clickCount)} clicks
                  <Link
                    href={`/product/${row.slug}`}
                    className="relative z-10 ml-1 text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
                  >
                    see details
                  </Link>
                </span>
              </span>
              <span className="shrink-0 font-mono text-base font-bold tabular text-accent sm:text-lg">
                {formatUsd(row.amount)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
