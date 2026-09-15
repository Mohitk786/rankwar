"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { addToWatchlist, isWatching, removeFromWatchlist } from "@/lib/watchlist-storage";
import { Button } from "@/components/ui/button";

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

  if (!mounted) return <span className="inline-block h-9 w-30" aria-hidden />;

  return (
    <Button type="button" variant={watching ? "secondary" : "outline"} onClick={toggle}>
      {watching ? <Bell /> : <BellOff />}
      {watching ? "Watching" : "Watch"}
    </Button>
  );
}
