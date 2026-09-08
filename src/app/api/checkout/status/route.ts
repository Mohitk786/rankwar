import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankContext } from "@/lib/ranking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id." }, { status: 400 });

  const checkout = await db.checkout.findUnique({ where: { stripeSessionId: sessionId } });
  if (!checkout) return NextResponse.json({ status: "UNKNOWN" });

  if (checkout.status === "SUCCEEDED") {
    const listing = await db.listing.findUnique({
      where: { normalizedKey: checkout.targetListingKey },
      include: { category: { select: { name: true } } },
    });
    if (!listing) return NextResponse.json({ status: "SUCCEEDED", listingSlug: null });

    const rank = await getRankContext(listing);
    return NextResponse.json({
      status: "SUCCEEDED",
      listingSlug: listing.slug,
      displayName: listing.displayName,
      categoryName: listing.category.name,
      amount: listing.currentAmount,
      overallRank: rank.overallRank,
      overallTotal: rank.overallTotal,
      categoryRank: rank.categoryRank,
      categoryTotal: rank.categoryTotal,
    });
  }

  return NextResponse.json({ status: checkout.status });
}
