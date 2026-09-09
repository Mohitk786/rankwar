import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitorId } from "@/lib/visitor";
import { getClientIp, hashIp, rateLimit } from "@/lib/abuse";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const listing = await db.listing.findUnique({ where: { slug } });
  if (!listing || listing.status === "REMOVED") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const visitorId = await getOrCreateVisitorId();
  const ip = getClientIp(request.headers);
  const ipHash = hashIp(ip);

  // Never block the actual navigation on rate limiting — excess clicks
  // still redirect, they just aren't counted toward the public number.
  const isCounted = rateLimit(`click:${visitorId}:${listing.id}`, 1, 30 * 60_000);

  await db.click.create({
    data: {
      listingId: listing.id,
      visitorId,
      ipHash,
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
      isCounted,
    },
  });

  const destination = new URL(listing.destinationUrl);
  destination.searchParams.set("utm_source", "whos1");

  return NextResponse.redirect(destination);
}
