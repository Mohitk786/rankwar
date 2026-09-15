import { db } from "./db";
import { normalizeSubmission } from "./normalize-url";
import { MIN_RAISE_INCREMENT, TAKE_FIRST_PLACE_MARGIN } from "./pricing";

export function emptyBoardPrice(currentTop: number, minEmpty = 10) {
  return currentTop === 0 ? minEmpty : currentTop + TAKE_FIRST_PLACE_MARGIN;
}

export async function resolveSuggestedAmount(
  currentTop: number,
  listingParam?: string,
  amountParam?: string,
  minEmpty = 10,
) {
  let suggestedAmount = emptyBoardPrice(currentTop, minEmpty);

  if (listingParam) {
    try {
      const { normalizedKey } = normalizeSubmission(listingParam);
      const existing = await db.listing.findUnique({
        where: { normalizedKey },
        select: { currentAmount: true },
      });
      if (existing) suggestedAmount = existing.currentAmount + MIN_RAISE_INCREMENT;
    } catch {
      // invalid listing param — keep the board default
    }
  }

  const parsedAmount = amountParam ? Number.parseInt(amountParam, 10) : NaN;
  if (Number.isInteger(parsedAmount) && parsedAmount >= 1) {
    suggestedAmount = parsedAmount;
  }

  return suggestedAmount;
}
