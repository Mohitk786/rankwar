import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { uniqueSlugFor } from "./slugify";

/**
 * Whenever a payment raises a listing's amount past other active listings,
 * those listings just got overtaken — record it so the product page and
 * watchlist can surface "you were passed" without anyone needing to notice
 * on their own. Amount-only comparison (never rank numbers): cheap, and the
 * exact rank at the moment doesn't matter — only the fact of being passed does.
 */
async function recordOvertakenEvents(
  tx: Prisma.TransactionClient,
  raiser: { id: string; displayName: string; slug: string; categoryId: string },
  oldAmount: number,
  newAmount: number
) {
  if (newAmount <= oldAmount) return;

  const [overallAffected, categoryAffected, category] = await Promise.all([
    tx.listing.findMany({
      where: { id: { not: raiser.id }, status: "ACTIVE", currentAmount: { gte: oldAmount, lt: newAmount } },
      select: { id: true },
    }),
    tx.listing.findMany({
      where: {
        id: { not: raiser.id },
        status: "ACTIVE",
        categoryId: raiser.categoryId,
        currentAmount: { gte: oldAmount, lt: newAmount },
      },
      select: { id: true },
    }),
    tx.category.findUnique({ where: { id: raiser.categoryId }, select: { name: true } }),
  ]);

  const events: Prisma.RankEventCreateManyInput[] = [
    ...overallAffected.map((l) => ({
      listingId: l.id,
      scope: "OVERALL" as const,
      overtakenByDisplayName: raiser.displayName,
      overtakenBySlug: raiser.slug,
    })),
    ...categoryAffected.map((l) => ({
      listingId: l.id,
      scope: "CATEGORY" as const,
      categoryName: category?.name ?? null,
      overtakenByDisplayName: raiser.displayName,
      overtakenBySlug: raiser.slug,
    })),
  ];

  if (events.length > 0) {
    await tx.rankEvent.createMany({ data: events });
  }
}

/**
 * Applies a confirmed Stripe Checkout Session to the board: creates the
 * listing (first payment) or atomically raises it (repeat payment), and
 * records the append-only Bid row. Idempotent at the call site — the
 * webhook route only calls this once per unique Stripe event id, and this
 * function itself no-ops if the checkout was already applied.
 *
 * The `currentAmount: { increment }` update compiles to a single atomic
 * `UPDATE ... SET amount = amount + $delta` in Postgres, so two concurrent
 * webhooks raising the *same* listing serialize correctly via the row lock
 * the UPDATE takes — no explicit `SELECT ... FOR UPDATE` needed. Two
 * webhooks for *different* listings never contend at all.
 */
export async function applySucceededCheckoutSession(session: Stripe.Checkout.Session) {
  const checkoutId = session.metadata?.checkoutId;
  if (!checkoutId) return { applied: false as const, reason: "missing checkoutId in session metadata" };

  const checkout = await db.checkout.findUnique({ where: { id: checkoutId } });
  if (!checkout) return { applied: false as const, reason: "checkout not found" };
  if (checkout.status === "SUCCEEDED") return { applied: false as const, reason: "already applied" };

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  await db.$transaction(async (tx) => {
    const existing = await tx.listing.findUnique({ where: { normalizedKey: checkout.targetListingKey } });
    let listingId: string;
    let listingSlug: string;
    let listingDisplayName: string;
    let categoryId: string;
    let resultingTotal: number;
    let oldAmount: number;

    if (existing) {
      oldAmount = existing.currentAmount;
      const updated = await tx.listing.update({
        where: { id: existing.id },
        data: {
          currentAmount: { increment: checkout.deltaAmount },
          raiseCount: { increment: 1 },
          lastPaidAt: new Date(),
        },
      });
      listingId = updated.id;
      listingSlug = updated.slug;
      listingDisplayName = updated.displayName;
      categoryId = updated.categoryId;
      resultingTotal = updated.currentAmount;
    } else {
      oldAmount = 0;
      const slug = await uniqueSlugFor(checkout.targetDisplayName, tx);
      const now = new Date();
      const created = await tx.listing.create({
        data: {
          type: checkout.listingType,
          normalizedKey: checkout.targetListingKey,
          slug,
          destinationUrl: checkout.targetDestinationUrl,
          displayName: checkout.targetDisplayName,
          description: checkout.targetDescription,
          imageUrl: checkout.targetImageUrl,
          faviconUrl: checkout.targetFaviconUrl,
          categoryId: checkout.targetCategoryId,
          currentAmount: checkout.deltaAmount,
          raiseCount: 0,
          firstPaidAt: now,
          lastPaidAt: now,
        },
      });
      listingId = created.id;
      listingSlug = created.slug;
      listingDisplayName = created.displayName;
      categoryId = created.categoryId;
      resultingTotal = created.currentAmount;
    }

    await tx.bid.create({
      data: {
        listingId,
        amount: checkout.deltaAmount,
        resultingTotal,
        checkoutId: checkout.id,
        createdAt: new Date(),
      },
    });

    await recordOvertakenEvents(
      tx,
      { id: listingId, displayName: listingDisplayName, slug: listingSlug, categoryId },
      oldAmount,
      resultingTotal
    );

    await tx.checkout.update({
      where: { id: checkout.id },
      data: { status: "SUCCEEDED", stripePaymentIntentId: paymentIntentId },
    });
  });

  return { applied: true as const };
}

export async function markCheckoutFailed(sessionId: string) {
  await db.checkout
    .updateMany({ where: { stripeSessionId: sessionId, status: { in: ["INITIATED", "PENDING"] } }, data: { status: "FAILED" } })
    .catch(() => {});
}

export async function markCheckoutExpired(sessionId: string) {
  await db.checkout
    .updateMany({ where: { stripeSessionId: sessionId, status: { in: ["INITIATED", "PENDING"] } }, data: { status: "EXPIRED" } })
    .catch(() => {});
}

export async function flagListingForDispute(paymentIntentId: string, reason: string) {
  const checkout = await db.checkout.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!checkout) return;
  const listing = await db.listing.findUnique({ where: { normalizedKey: checkout.targetListingKey } });
  if (!listing) return;
  await db.moderationFlag.create({ data: { listingId: listing.id, reason } });
}
