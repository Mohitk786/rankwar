import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { formatCount, formatRelativeTime, formatUsd } from "@/lib/format";
import { TAKE_FIRST_PLACE_MARGIN } from "@/lib/pricing";
import {
  getCategoryShortName,
  getCategoryVisual,
} from "@/lib/category-visuals";
import { ClaimRankButton } from "@/components/ClaimRankButton";
import { FirstPlaceNudge } from "@/components/FirstPlaceNudge";
import { ScallopStrip } from "@/components/ScallopStrip";
import { ListingFavicon } from "@/components/ListingFavicon";
import { cn } from "@/lib/utils";

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

function rankHighlightStyle(rank: number): CSSProperties | undefined {
  const falloff = Math.pow(0.62, rank - 1);
  if (falloff < 0.05) return undefined;
  return {
    backgroundImage: `linear-gradient(90deg, color-mix(in oklab, var(--primary) calc(var(--rank-wash) * ${falloff.toFixed(3)}), transparent) 0%, color-mix(in oklab, var(--primary) calc(var(--rank-wash) * ${(falloff * 0.35).toFixed(3)}), transparent) 52%, transparent 100%)`,
  };
}

export function BoardTable({
  rows,
  emptyLabel = "Nothing here yet.",
  isGlobalAllTimeBoard = false,
  showNudge = true,
  insertAfter,
  insert,
}: {
  rows: BoardRow[];
  emptyLabel?: string;
  isGlobalAllTimeBoard?: boolean;
  showNudge?: boolean;
  insertAfter?: number;
  insert?: ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  const splitAt =
    insert && insertAfter ? Math.min(insertAfter, rows.length) : rows.length;
  const head = rows.slice(0, splitAt);
  const tail = rows.slice(splitAt);

  return (
    <div className="space-y-4">
      <BoardList
        rows={head}
        startRank={1}
        isGlobalAllTimeBoard={isGlobalAllTimeBoard}
        showNudge={showNudge}
      />
      {insert}
      {tail.length > 0 ? (
        <BoardList
          rows={tail}
          startRank={splitAt + 1}
          isGlobalAllTimeBoard={false}
          showNudge={false}
        />
      ) : null}
    </div>
  );
}

function BoardList({
  rows,
  startRank,
  isGlobalAllTimeBoard,
  showNudge,
}: {
  rows: BoardRow[];
  startRank: number;
  isGlobalAllTimeBoard: boolean;
  showNudge: boolean;
}) {
  return (
    <div className={cn("relative", showNudge && startRank === 1 && "mt-16")}>
      <ol className="overflow-visible rounded-lg border border-border bg-background">
        {rows.map((row, index) => {
          const rank = startRank + index;
          const margin =
            isGlobalAllTimeBoard && rank === 1 ? TAKE_FIRST_PLACE_MARGIN : 1;
          const priceToBeat = row.amount + margin;
          const { icon: CategoryIcon } = getCategoryVisual(row.category.slug);

          return (
            <li
              key={row.id}
              className="group/row relative cursor-pointer first:rounded-t-lg last:rounded-b-lg hover:z-20 hover:bg-card"
              style={rankHighlightStyle(rank)}
            >
              {showNudge && rank === 1 && <FirstPlaceNudge />}
              {index > 0 && (
                <ScallopStrip
                  patternId={`rw-scallop-line-${startRank}-${index}`}
                />
              )}
              <a
                href={`/go/${row.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Visit ${row.displayName}`}
                rel="sponsored nofollow"
              />

              <ClaimRankButton
                amount={priceToBeat}
                className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 transition-opacity duration-150 group-hover/row:pointer-events-auto group-hover/row:opacity-100"
              />

              <div className="relative z-10 flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
                <span className="w-9 shrink-0 text-right font-serif text-sm tabular text-muted-foreground">
                  #{rank}
                </span>
                <ListingFavicon src={row.faviconUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium transition-colors group-hover/row:text-primary">
                    {row.displayName}
                  </span>
                  {row.description ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {row.description}
                    </span>
                  ) : null}
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CategoryIcon className="h-3 w-3" strokeWidth={2.5} />
                      {getCategoryShortName(
                        row.category.slug,
                        row.category.name,
                      )}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{formatRelativeTime(row.lastPaidAt)}</span>
                    <span aria-hidden>·</span>
                    <span className="font-medium text-primary">
                      {formatCount(row.clickCount)} clicks
                    </span>
                    <span aria-hidden>·</span>
                    <Link
                      href={`/product/${row.slug}`}
                      className="relative z-10 text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
                    >
                      see details
                    </Link>
                  </span>
                </span>
                <span className="shrink-0 font-serif text-base font-semibold tabular tracking-tight text-primary sm:text-lg">
                  {formatUsd(row.amount)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
