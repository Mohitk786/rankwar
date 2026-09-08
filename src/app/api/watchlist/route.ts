import { NextResponse } from "next/server";
import { getWatchlistStatus } from "@/lib/ranking";
import { rateLimit, getClientIp } from "@/lib/abuse";

const MAX_SLUGS = 30;

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`watchlist:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("slugs") ?? "";
  const slugs = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  ).slice(0, MAX_SLUGS);

  const rows = await getWatchlistStatus(slugs);
  return NextResponse.json({ rows });
}
