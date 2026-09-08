import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  applySucceededCheckoutSession,
  flagListingForDispute,
  markCheckoutExpired,
  markCheckoutFailed,
} from "@/lib/payment-processing";

// Stripe requires the raw request body for signature verification, so this
// route must never run any body-parsing middleware ahead of it.
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set — refusing to process webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Idempotency: every event is keyed by its unique Stripe event id. An
  // already-APPLIED event is a true duplicate delivery and is skipped: but
  // an event that previously failed mid-processing (status REJECTED, or
  // RECEIVED if the process crashed before updating it) must still be
  // retried, since Stripe retrying on our 500 is exactly what lets us
  // self-heal without a separate reconciliation pass.
  const existingEvent = await db.paymentEvent.findUnique({ where: { eventId: event.id } });
  if (existingEvent?.status === "APPLIED" || existingEvent?.status === "DUPLICATE_IGNORED") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (!existingEvent) {
    await db.paymentEvent.create({
      data: {
        provider: "stripe",
        eventId: event.id,
        eventType: event.type,
        rawPayload: JSON.parse(JSON.stringify(event)),
      },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await applySucceededCheckoutSession(session);
        }
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markCheckoutFailed(session.id);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markCheckoutExpired(session.id);
        break;
      }
      case "charge.refunded":
      case "charge.dispute.created": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : (charge.payment_intent?.id ?? null);
        if (paymentIntentId) {
          await flagListingForDispute(paymentIntentId, event.type === "charge.refunded" ? "refund" : "chargeback");
        }
        break;
      }
      default:
        break;
    }

    await db.paymentEvent.update({
      where: { eventId: event.id },
      data: { status: "APPLIED", processedAt: new Date() },
    });
  } catch (err) {
    console.error("Failed to process Stripe webhook event", event.id, err);
    await db.paymentEvent
      .update({
        where: { eventId: event.id },
        data: { status: "REJECTED", error: err instanceof Error ? err.message : "unknown error" },
      })
      .catch(() => {});
    // Return 500 so Stripe retries — the PaymentEvent row (and the
    // reconciliation job) means a retry can never double-apply the bid.
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
