import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankContext } from "@/lib/ranking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutId = searchParams.get("checkoutId");
  if (!checkoutId) return NextResponse.json({ error: "Missing checkoutId." }, { status: 400 });

  let checkout = await db.checkout.findUnique({ where: { id: checkoutId } });
  if (!checkout) return NextResponse.json({ status: "UNKNOWN" });

  // Dodo has no webhook for an abandoned checkout session (a session never
  // fires any event unless a payment was actually attempted), so unlike
  // Stripe's `checkout.session.expired` webhook, expiry here is lazy —
  // checked on each poll instead of being event-driven.
  if ((checkout.status === "INITIATED" || checkout.status === "PENDING") && checkout.expiresAt < new Date()) {
    checkout = await db.checkout.update({ where: { id: checkout.id }, data: { status: "EXPIRED" } });
  }

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
