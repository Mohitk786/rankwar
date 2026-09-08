"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { addToWatchlist, isWatching, removeFromWatchlist } from "@/lib/watchlist-storage";

export function WatchButton({ slug }: { slug: string }) {
  const [watching, setWatching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // One-time read of client-only localStorage state to avoid an SSR/client markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWatching(isWatching(slug));
    setMounted(true);
  }, [slug]);

  function toggle() {
    if (watching) {
      removeFromWatchlist(slug);
      setWatching(false);
    } else {
      addToWatchlist(slug);
      setWatching(true);
    }
  }

  // Avoid a hydration flash: render nothing until we've read localStorage client-side.
  if (!mounted) return <span className="inline-block h-9 w-30" aria-hidden />;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
        watching
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {watching ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      {watching ? "Watching" : "Watch"}
    </button>
  );
}
