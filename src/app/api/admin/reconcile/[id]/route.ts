import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDodo } from "@/lib/dodo";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { applySucceededCheckoutSession } from "@/lib/payment-processing";

/**
 * Manually re-checks a stuck Checkout directly against Dodo Payments — the
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
  if (checkout.dodoSessionId.startsWith("pending_")) {
    return NextResponse.json({ error: "This checkout never reached Dodo Payments." }, { status: 400 });
  }

  const session = await getDodo().checkoutSessions.retrieve(checkout.dodoSessionId);

  if (session.payment_status === "succeeded" && session.payment_id) {
    const result = await applySucceededCheckoutSession({ checkoutId: checkout.id, dodoPaymentId: session.payment_id });
    return NextResponse.json({ ok: true, ...result, paymentStatus: session.payment_status });
  }

  if (session.payment_status === "cancelled" || session.payment_status === "failed") {
    await db.checkout.update({ where: { id }, data: { status: "FAILED" } });
  } else if (checkout.expiresAt < new Date()) {
    await db.checkout.update({ where: { id }, data: { status: "EXPIRED" } });
  }

  return NextResponse.json({
    ok: true,
    applied: false,
    paymentStatus: session.payment_status,
  });
}
