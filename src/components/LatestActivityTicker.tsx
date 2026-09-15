import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/LiveDot";

export type ActivityItem = {
  id: string;
  listing: { slug: string; displayName: string; faviconUrl: string | null };
  amount: number;
  overallRank: number;
  isNew: boolean;
  createdAt: Date;
};

export function LatestActivityTicker({
  items,
  className,
}: {
  items: ActivityItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={cn(className)}>
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <LiveDot />
        Latest activity
      </h2>
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.listing.slug}`}
              className="flex shrink-0 items-center gap-2.5 rounded-md bg-muted/80 px-5 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-background ring-1 ring-foreground/6">
                {item.listing.faviconUrl ? (
                  <Image
                    src={item.listing.faviconUrl}
                    alt=""
                    fill
                    sizes="36px"
                    unoptimized
                    className="object-contain"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight">
                  {item.listing.displayName}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  #{item.overallRank} · {formatUsd(item.amount)}
                </span>
                <span className="mt-0.5 block text-xs leading-tight text-muted-foreground/70">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </span>
            </Link>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background to-transparent dark:from-black"
        />
      </div>
    </div>
  );
}
