import { NextResponse } from "next/server";
import { closeDailyBoard } from "@/lib/daily-close";

// Wire this up to a daily scheduler hitting it once shortly after UTC
// midnight with Authorization: Bearer <CRON_SECRET>. Vercel Cron issues a
// GET and auto-attaches that header whenever the env var is named
// CRON_SECRET, so GET is handled here too (not just POST for manual/other
// schedulers).
async function handleClose(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    const result = await closeDailyBoard(dateStr);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to close daily board." }, { status: 400 });
  }
}

export const GET = handleClose;
export const POST = handleClose;
