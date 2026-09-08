import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { getStripe } from "./stripe";
import { normalizeSubmission, SubmissionValidationError } from "./normalize-url";
import { getPricingContext, validateTargetAmount, PricingError } from "./pricing";
import { resolveMetadata } from "./metadata";

export const CheckoutRequestSchema = z.object({
  input: z.string().trim().min(1).max(500),
  categorySlug: z.string().min(1).max(60).optional(),
  targetAmount: z.number().int().positive(),
  tosAgreed: z.literal(true),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export class CheckoutRequestError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function createCheckoutSession(input: CheckoutRequest, visitorId: string | null) {
  let submission;
  try {
    submission = normalizeSubmission(input.input);
  } catch (err) {
    if (err instanceof SubmissionValidationError) throw new CheckoutRequestError(err.message);
    throw err;
  }

  const pricingContext = await getPricingContext(submission.normalizedKey);

  let deltaAmount: number;
  try {
    deltaAmount = validateTargetAmount(input.targetAmount, pricingContext);
  } catch (err) {
    if (err instanceof PricingError) throw new CheckoutRequestError(err.message);
    throw err;
  }

  let categoryId: string;
  if (pricingContext.existingAmount !== null) {
    const existingListing = await db.listing.findUnique({
      where: { normalizedKey: submission.normalizedKey },
      select: { categoryId: true },
    });
    if (!existingListing) throw new CheckoutRequestError("That listing could not be found.", 404);
    categoryId = existingListing.categoryId;
  } else {
    if (!input.categorySlug) throw new CheckoutRequestError("Choose a category.");
    const category = await db.category.findUnique({ where: { slug: input.categorySlug } });
    if (!category) throw new CheckoutRequestError("Unknown category.");
    categoryId = category.id;
  }

  const metadata = pricingContext.existingAmount === null ? await resolveMetadata(submission) : null;

  const placeholderSessionId = `pending_${randomBytes(16).toString("hex")}`;
  const checkout = await db.checkout.create({
    data: {
      stripeSessionId: placeholderSessionId,
      visitorId,
      listingType: submission.type,
      targetListingKey: submission.normalizedKey,
      targetDestinationUrl: submission.destinationUrl,
      targetDisplayName: metadata?.displayName ?? submission.displayHint,
      targetDescription: metadata?.description ?? null,
      targetImageUrl: metadata?.imageUrl ?? null,
      targetFaviconUrl: metadata?.faviconUrl ?? null,
      targetCategoryId: categoryId,
      targetAmount: input.targetAmount,
      deltaAmount,
      status: "INITIATED",
      tosAgreedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `RankWar rank — ${checkout.targetDisplayName}`,
              description:
                pricingContext.existingAmount !== null
                  ? "Raise your rank on the RankWar leaderboard"
                  : "New listing on the RankWar leaderboard",
            },
            unit_amount: deltaAmount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
      billing_address_collection: "required",
      metadata: { checkoutId: checkout.id },
    });

    await db.checkout.update({
      where: { id: checkout.id },
      data: { stripeSessionId: session.id, status: "PENDING" },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  } catch (err) {
    await db.checkout.update({ where: { id: checkout.id }, data: { status: "FAILED" } }).catch(() => {});
    if (err instanceof CheckoutRequestError) throw err;
    throw new CheckoutRequestError(
      err instanceof Error && err.message.includes("STRIPE_SECRET_KEY")
        ? err.message
        : "Could not start checkout with Stripe. Please try again.",
      502
    );
  }
}
