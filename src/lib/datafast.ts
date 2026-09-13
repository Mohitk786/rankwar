const DATAFAST_BASE_URL = "https://data.whos1.bid/api/v1";

async function datafastFetch<T>(path: string, params: Record<string, string>, revalidateSeconds: number): Promise<T | null> {
  const apiKey = process.env.DATAFAST_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`${DATAFAST_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export type VisitorStats = { onlineNow: number; totalVisitors: number };

/**
 * Powers the header's "N online · M visitors" badge. Returns null (badge
 * hidden) whenever DATAFAST_API_KEY isn't set or the API call fails —
 * DataFast being unreachable should never break page rendering.
 */
export async function getVisitorStats(): Promise<VisitorStats | null> {
  const [realtime, overview] = await Promise.all([
    datafastFetch<{ visitors: number }>("/analytics/realtime", {}, 60),
    datafastFetch<{ visitors: number }>("/analytics/overview", { fields: "visitors" }, 300),
  ]);
  if (!realtime || !overview) return null;
  return { onlineNow: realtime.visitors, totalVisitors: overview.visitors };
}
