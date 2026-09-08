import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id." }, { status: 400 });

  const checkout = await db.checkout.findUnique({ where: { stripeSessionId: sessionId } });
  if (!checkout) return NextResponse.json({ status: "UNKNOWN" });

  if (checkout.status === "SUCCEEDED") {
    const listing = await db.listing.findUnique({
      where: { normalizedKey: checkout.targetListingKey },
      select: { slug: true },
    });
    return NextResponse.json({ status: "SUCCEEDED", listingSlug: listing?.slug ?? null });
  }

  return NextResponse.json({ status: checkout.status });
}
