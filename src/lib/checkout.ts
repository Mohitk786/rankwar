import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { getDodo } from "./dodo";
import { normalizeSubmission, SubmissionValidationError } from "./normalize-url";
import { getPricingContext, validateTargetAmount, PricingError } from "./pricing";
import { resolveMetadata } from "./metadata";
import { getSiteUrl } from "./site-url";

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
      dodoSessionId: placeholderSessionId,
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

  const siteUrl = getSiteUrl();

  try {
    const productId = process.env.DODO_PRODUCT_ID;
    if (!productId) {
      throw new Error("DODO_PRODUCT_ID is not set. Add the rank-raise product id to .env before using checkout.");
    }

    const dodo = getDodo();
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1, amount: deltaAmount * 100 }],
      return_url: `${siteUrl}/success?checkoutId=${checkout.id}`,
      cancel_url: `${siteUrl}/`,
      metadata: { checkoutId: checkout.id },
    });

    await db.checkout.update({
      where: { id: checkout.id },
      data: { dodoSessionId: session.session_id, status: "PENDING" },
    });

    if (!session.checkout_url) throw new Error("Dodo Payments did not return a checkout URL.");
    return { url: session.checkout_url };
  } catch (err) {
    await db.checkout.update({ where: { id: checkout.id }, data: { status: "FAILED" } }).catch(() => {});
    if (err instanceof CheckoutRequestError) throw err;
    throw new CheckoutRequestError(
      err instanceof Error && (err.message.includes("DODO_PAYMENTS_API_KEY") || err.message.includes("DODO_PRODUCT_ID"))
        ? err.message
        : "Could not start checkout with Dodo Payments. Please try again.",
      502
    );
  }
}
