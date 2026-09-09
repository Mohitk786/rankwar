import Link from "next/link";
import { Flame } from "lucide-react";
import { formatCount, formatRelativeTime, formatUsd, minutesAgo } from "@/lib/format";
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

/** Rank 1/2/3 read as gold/silver/bronze-in-brand-colors medallions — everyone below is a plain number. */
const TOP_RANK_STYLES = [
  { medal: "bg-gradient-to-br from-accent to-emerald-600 text-accent-foreground ring-2 ring-accent/40 shadow-[0_0_12px_-2px] shadow-accent/50", edge: "before:bg-accent" },
  { medal: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-2 ring-amber-400/40", edge: "before:bg-amber-400" },
  { medal: "bg-gradient-to-br from-orange-400 to-orange-700 text-orange-50 ring-2 ring-orange-500/30", edge: "before:bg-orange-500" },
];

const HOT_WINDOW_MINUTES = 180;

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

  const hotSince = minutesAgo(HOT_WINDOW_MINUTES);

  return (
    <ol className="divide-y divide-border rounded-lg border border-border">
      {rows.map((row, index) => {
        const margin = isGlobalAllTimeBoard && index === 0 ? TAKE_FIRST_PLACE_MARGIN : 1;
        const priceToBeat = row.amount + margin;
        const topStyle = TOP_RANK_STYLES[index];
        const isHot = row.lastPaidAt > hotSince;
        const isFirstRow = index === 0;
        const isLastRow = index === rows.length - 1;

        return (
          <li
            key={row.id}
            className={`group/row relative transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface ${
              topStyle
                ? `before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[''] ${topStyle.edge} ${
                    isFirstRow ? "before:rounded-tl-lg" : ""
                  } ${isLastRow ? "before:rounded-bl-lg" : ""}`
                : ""
            }`}
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
              {topStyle ? (
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular ${topStyle.medal}`}
                >
                  {index + 1}
                </span>
              ) : (
                <span className="w-7 shrink-0 text-right font-mono text-sm tabular text-muted">{index + 1}</span>
              )}
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
                  {isHot ? (
                    <span
                      title="Raised recently"
                      className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-orange-500"
                    >
                      <Flame className="h-2.5 w-2.5" strokeWidth={2.5} />
                      hot
                    </span>
                  ) : null}
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
