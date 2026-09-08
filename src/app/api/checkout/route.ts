import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, CheckoutRequestSchema, CheckoutRequestError } from "@/lib/checkout";
import { getOrCreateVisitorId } from "@/lib/visitor";
import { rateLimit, getClientIp } from "@/lib/abuse";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`checkout:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = CheckoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const visitorId = await getOrCreateVisitorId();

  try {
    const result = await createCheckoutSession(parsed.data, visitorId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CheckoutRequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("checkout error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
