"use client";

const KEY = "whos1:watchlist";

/**
 * Per-browser watchlist — deliberately localStorage-only, no account or
 * server-side "watch" row. Who's #1 has no login system by design, so this
 * is the only way to let a visitor track listings across return visits
 * without inventing accounts/email just for this one feature.
 */
export function getWatchlist(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function save(slugs: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Storage can be unavailable (private mode, quota) — watching silently no-ops.
  }
}

export function isWatching(slug: string): boolean {
  return getWatchlist().includes(slug);
}

export function addToWatchlist(slug: string) {
  const current = getWatchlist();
  if (!current.includes(slug)) save([slug, ...current]);
}

export function removeFromWatchlist(slug: string) {
  save(getWatchlist().filter((s) => s !== slug));
}
