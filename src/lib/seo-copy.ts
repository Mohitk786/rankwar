import { formatRelativeTime, formatUsd } from "./format";

export type ListingFaqInput = {
  displayName: string;
  currentAmount: number;
  raiseCount: number;
  lastPaidAt: Date;
  category: { name: string };
  overallRank: number;
  overallTotal: number;
  categoryRank: number;
  categoryTotal: number;
  clickCount: number;
};

export function generateListingFaq(listing: ListingFaqInput): { question: string; answer: string }[] {
  const faq: { question: string; answer: string }[] = [];

  faq.push({
    question: `What rank does ${listing.displayName} hold on RankWar?`,
    answer: `${listing.displayName} is currently #${listing.overallRank} of ${listing.overallTotal} overall, and #${listing.categoryRank} of ${listing.categoryTotal} in ${listing.category.name}, at ${formatUsd(listing.currentAmount)}.`,
  });

  if (listing.raiseCount > 0) {
    faq.push({
      question: `Has ${listing.displayName} raised its rank before?`,
      answer: `Yes — the listing has been raised ${listing.raiseCount} ${listing.raiseCount === 1 ? "time" : "times"}, most recently ${formatRelativeTime(listing.lastPaidAt)}.`,
    });
  }

  if (listing.clickCount > 0) {
    faq.push({
      question: `How many visitors has ${listing.displayName} gotten from RankWar?`,
      answer: `${listing.clickCount.toLocaleString("en-US")} recorded clicks from the board so far.`,
    });
  }

  const outrankAmount = listing.overallRank === 1 ? listing.currentAmount + 5 : listing.currentAmount + 1;
  faq.push({
    question: `How do I outrank ${listing.displayName}?`,
    answer: `Submit your own listing and pay at least ${formatUsd(outrankAmount)} — rank is purely a function of cumulative dollars paid, so beating that number moves you above ${listing.displayName}.`,
  });

  return faq;
}
