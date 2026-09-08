import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { formatRelativeTime, formatUsd } from "@/lib/format";

export type ActivityItem = {
  id: string;
  listing: { slug: string; displayName: string; faviconUrl: string | null };
  amount: number;
  overallRank: number;
  isNew: boolean;
  createdAt: Date;
};

export function LatestActivityTicker({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        Latest activity
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.listing.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition-colors hover:border-accent/50"
          >
            <span className="h-6 w-6 shrink-0 overflow-hidden rounded bg-background">
              {item.listing.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.listing.faviconUrl} alt="" width={24} height={24} className="h-full w-full object-contain" />
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 truncate text-sm font-medium">
                {item.isNew ? (
                  <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                ) : (
                  <TrendingUp className="h-3 w-3 shrink-0 text-accent" />
                )}
                {item.listing.displayName}
              </span>
              <span className="block text-xs text-muted">
                at #{item.overallRank} · {formatUsd(item.amount)} · {formatRelativeTime(item.createdAt)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
