import { db } from "./db";

export const MIN_NEW_LISTING_AMOUNT = 1;
export const MIN_RAISE_INCREMENT = 1;
export const TAKE_FIRST_PLACE_MARGIN = 5;
export const MAX_AMOUNT = 999_999;

export class PricingError extends Error {}

export type PricingContext = {
  existingAmount: number | null;
  currentTopAmount: number;
  minimumTarget: number;
};

/**
 * current #1's amount (0 if the board is empty) plus, if a listing with
 * this key already exists, its current amount — used to compute both the
 * "minimum to take #1" and "minimum to raise your own listing" rules.
 *
 * A REMOVED listing is excluded here on purpose: resubmitting its URL is
 * treated as a brand-new listing (fresh minimum, fresh metadata) rather
 * than requiring a raise past whatever amount it held before removal.
 */
export async function getPricingContext(normalizedKey: string): Promise<PricingContext> {
  const [existing, top] = await Promise.all([
    db.listing.findFirst({ where: { normalizedKey, status: { not: "REMOVED" } }, select: { currentAmount: true } }),
    db.listing.findFirst({
      where: { status: "ACTIVE" },
      orderBy: [{ currentAmount: "desc" }, { firstPaidAt: "asc" }],
      select: { currentAmount: true },
    }),
  ]);

  const currentTopAmount = top?.currentAmount ?? 0;
  const existingAmount = existing?.currentAmount ?? null;
  const minimumTarget = existingAmount !== null ? existingAmount + MIN_RAISE_INCREMENT : MIN_NEW_LISTING_AMOUNT;

  return { existingAmount, currentTopAmount, minimumTarget };
}

/**
 * Validates a buyer-requested target amount against live board state and
 * returns the delta that should actually be charged. Never trust a
 * client-submitted amount as final — this is always recomputed server-side
 * at checkout-creation time from the database, not from anything the
 * client asserts.
 */
export function validateTargetAmount(target: number, ctx: PricingContext): number {
  if (!Number.isInteger(target)) {
    throw new PricingError("Amounts are whole US dollars only.");
  }
  if (target > MAX_AMOUNT) {
    throw new PricingError(`The maximum is $${MAX_AMOUNT.toLocaleString()}.`);
  }
  if (target < ctx.minimumTarget) {
    throw new PricingError(`The minimum right now is $${ctx.minimumTarget.toLocaleString()}.`);
  }

  const alreadyOwnsTop = ctx.existingAmount !== null && ctx.existingAmount >= ctx.currentTopAmount;
  const wouldTakeFirstPlace = ctx.currentTopAmount > 0 && target > ctx.currentTopAmount;

  if (wouldTakeFirstPlace && !alreadyOwnsTop) {
    const minToTakeFirst = ctx.currentTopAmount + TAKE_FIRST_PLACE_MARGIN;
    if (target < minToTakeFirst) {
      throw new PricingError(`Taking #1 costs at least $${minToTakeFirst.toLocaleString()}.`);
    }
  }

  return ctx.existingAmount !== null ? target - ctx.existingAmount : target;
}
