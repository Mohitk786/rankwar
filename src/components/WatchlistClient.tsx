"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Trophy, X } from "lucide-react";
import { formatRelativeTime, formatUsd } from "@/lib/format";
import { getWatchlist, removeFromWatchlist } from "@/lib/watchlist-storage";

type WatchRow = {
  slug: string;
  displayName: string;
  currentAmount: number;
  status: string;
  categoryName: string;
  overallRank: number;
  overallTotal: number;
  categoryRank: number;
  categoryTotal: number;
  latestEvent: { overtakenByDisplayName: string; scope: "OVERALL" | "CATEGORY"; createdAt: string } | null;
};

export function WatchlistClient() {
  const [slugs, setSlugs] = useState<string[] | null>(null);
  const [rows, setRows] = useState<WatchRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // One-time read of client-only localStorage state to avoid an SSR/client markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlugs(getWatchlist());
  }, []);

  useEffect(() => {
    if (slugs === null) return;
    if (slugs.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived from the localStorage read above, not a subscription
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/watchlist?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((res) => res.json())
      .then((data) => setRows(data.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [slugs]);

  function remove(slug: string) {
    removeFromWatchlist(slug);
    setSlugs((prev) => (prev ?? []).filter((s) => s !== slug));
  }

  if (slugs === null || loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your watchlist…
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
        You&apos;re not watching anything yet. Hit <strong>Watch</strong> on any product page to track its rank here —
        stored only in this browser, no account needed.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {rows.map((row) => (
        <li key={row.slug} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/product/${row.slug}`} className="truncate font-medium hover:underline">
                {row.displayName}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                {row.status !== "ACTIVE" ? (
                  <span className="text-danger">No longer active</span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> #{row.overallRank} of {row.overallTotal} overall
                    </span>
                    <span>
                      #{row.categoryRank} of {row.categoryTotal} in {row.categoryName}
                    </span>
                  </>
                )}
              </div>
              {row.latestEvent ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Overtaken by {row.latestEvent.overtakenByDisplayName}
                  {row.latestEvent.scope === "CATEGORY" ? ` in ${row.categoryName}` : " overall"} ·{" "}
                  {formatRelativeTime(new Date(row.latestEvent.createdAt))}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-lg font-bold tabular text-accent">{formatUsd(row.currentAmount)}</span>
              <button
                type="button"
                onClick={() => remove(row.slug)}
                aria-label={`Stop watching ${row.displayName}`}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-background hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
