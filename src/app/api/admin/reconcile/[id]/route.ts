import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { applySucceededCheckoutSession } from "@/lib/payment-processing";

/**
 * Manually re-checks a stuck Checkout directly against Stripe — the
 * self-heal path for "payment succeeded but our webhook never arrived or
 * a DB write failed mid-processing." Safe to call repeatedly:
 * applySucceededCheckoutSession no-ops once the checkout is SUCCEEDED.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const checkout = await db.checkout.findUnique({ where: { id } });
  if (!checkout) return NextResponse.json({ error: "Checkout not found." }, { status: 404 });
  if (checkout.stripeSessionId.startsWith("pending_")) {
    return NextResponse.json({ error: "This checkout never reached Stripe." }, { status: 400 });
  }

  const session = await getStripe().checkout.sessions.retrieve(checkout.stripeSessionId);

  if (session.payment_status === "paid") {
    const result = await applySucceededCheckoutSession(session);
    return NextResponse.json({ ok: true, ...result, stripeStatus: session.status, paymentStatus: session.payment_status });
  }

  if (session.status === "expired") {
    await db.checkout.update({ where: { id }, data: { status: "EXPIRED" } });
  }

  return NextResponse.json({
    ok: true,
    applied: false,
    stripeStatus: session.status,
    paymentStatus: session.payment_status,
  });
}
