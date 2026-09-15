import { db } from "./db";
import { TAKE_FIRST_PLACE_MARGIN } from "./pricing";

const PAGE_SIZE = 100;

async function attachClickCounts<T extends { id: string }>(rows: T[]): Promise<(T & { clickCount: number })[]> {
  if (rows.length === 0) return [];
  const counts = await db.click.groupBy({
    by: ["listingId"],
    where: { listingId: { in: rows.map((r) => r.id) }, isCounted: true },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.listingId, c._count._all]));
  return rows.map((r) => ({ ...r, clickCount: map.get(r.id) ?? 0 }));
}

const categorySelect = { select: { slug: true, name: true } } as const;

export function getBoardCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });
}

export async function getAllTimeBoard(opts: { categorySlug?: string; limit?: number } = {}) {
  const listings = await db.listing.findMany({
    where: {
      status: "ACTIVE",
      category: opts.categorySlug ? { slug: opts.categorySlug } : undefined,
    },
    orderBy: [{ currentAmount: "desc" }, { firstPaidAt: "asc" }],
    take: opts.limit ?? PAGE_SIZE,
    include: { category: categorySelect },
  });
  const withClicks = await attachClickCounts(listings);
  return withClicks.map((l) => ({ ...l, amount: l.currentAmount }));
}

export async function getTodayBoard(opts: { categorySlug?: string; limit?: number } = {}) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const grouped = await db.bid.groupBy({
    by: ["listingId"],
    where: { createdAt: { gte: since } },
    _sum: { amount: true },
  });
  if (grouped.length === 0) return [];

  const sumMap = new Map(grouped.map((g) => [g.listingId, g._sum.amount ?? 0]));
  const listings = await db.listing.findMany({
    where: {
      id: { in: grouped.map((g) => g.listingId) },
      status: "ACTIVE",
      category: opts.categorySlug ? { slug: opts.categorySlug } : undefined,
    },
    include: { category: categorySelect },
  });

  const merged = listings
    .map((l) => ({ ...l, amount: sumMap.get(l.id) ?? 0 }))
    .sort((a, b) => b.amount - a.amount || a.firstPaidAt.getTime() - b.firstPaidAt.getTime())
    .slice(0, opts.limit ?? PAGE_SIZE);

  return attachClickCounts(merged);
}

export function utcDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function getDailyBoard(dateStr: string, categorySlug?: string) {
  const entries = await db.dailyLeaderboardEntry.findMany({
    where: {
      utcDate: utcDateOnly(dateStr),
      listing: categorySlug ? { category: { slug: categorySlug } } : undefined,
    },
    orderBy: { rank: "asc" },
    include: { listing: { include: { category: categorySelect } } },
  });
  const rows = entries.map((e) => ({ ...e.listing, amount: e.amount, rank: e.rank }));
  return attachClickCounts(rows);
}

export async function getDailyDates() {
  const rows = await db.dailyLeaderboardEntry.groupBy({
    by: ["utcDate"],
    _count: { _all: true },
    orderBy: { utcDate: "desc" },
  });
  return rows.map((r) => ({ date: r.utcDate.toISOString().slice(0, 10), count: r._count._all }));
}

export async function getListingBySlug(slug: string) {
  return db.listing.findUnique({
    where: { slug },
    include: { category: categorySelect },
  });
}

export async function getRankContext(listing: {
  id: string;
  currentAmount: number;
  firstPaidAt: Date;
  categoryId: string;
}) {
  const isAhead = {
    OR: [
      { currentAmount: { gt: listing.currentAmount } },
      { currentAmount: listing.currentAmount, firstPaidAt: { lt: listing.firstPaidAt } },
    ],
  };

  const [overallHigher, overallTotal, categoryHigher, categoryTotal] = await Promise.all([
    db.listing.count({ where: { status: "ACTIVE", ...isAhead } }),
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.listing.count({ where: { status: "ACTIVE", categoryId: listing.categoryId, ...isAhead } }),
    db.listing.count({ where: { status: "ACTIVE", categoryId: listing.categoryId } }),
  ]);

  return {
    overallRank: overallHigher + 1,
    overallTotal,
    categoryRank: categoryHigher + 1,
    categoryTotal,
  };
}

/**
 * The competitive ladder for a listing: who's directly above it (the
 * cheapest way to move up one spot) and what the true #1 currently costs
 * (the aspirational number) — answers "what would it cost me to move up?"
 * without the visitor doing any arithmetic themselves.
 */
export async function getLadder(listing: {
  id: string;
  currentAmount: number;
  firstPaidAt: Date;
  categoryId: string;
}) {
  const isAhead = {
    OR: [
      { currentAmount: { gt: listing.currentAmount } },
      { currentAmount: listing.currentAmount, firstPaidAt: { lt: listing.firstPaidAt } },
    ],
  };

  const [nextOverall, topOverall] = await Promise.all([
    db.listing.findFirst({
      where: { status: "ACTIVE", id: { not: listing.id }, ...isAhead },
      orderBy: [{ currentAmount: "asc" }],
      select: { displayName: true, currentAmount: true },
    }),
    db.listing.findFirst({
      where: { status: "ACTIVE" },
      orderBy: [{ currentAmount: "desc" }, { firstPaidAt: "asc" }],
      select: { displayName: true, currentAmount: true },
    }),
  ]);

  const isTop = !nextOverall;

  return {
    isTop,
    nextUp: nextOverall ? { name: nextOverall.displayName, priceToBeat: nextOverall.currentAmount + 1 } : null,
    topOverall:
      !isTop && topOverall
        ? { name: topOverall.displayName, priceToBeat: topOverall.currentAmount + TAKE_FIRST_PLACE_MARGIN }
        : null,
  };
}

export async function getAllCategoriesWithTop3() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return Promise.all(
    categories.map(async (category) => {
      const [top, totalCount] = await Promise.all([
        db.listing.findMany({
          where: { categoryId: category.id, status: "ACTIVE" },
          orderBy: [{ currentAmount: "desc" }, { firstPaidAt: "asc" }],
          take: 3,
        }),
        db.listing.count({ where: { categoryId: category.id, status: "ACTIVE" } }),
      ]);
      return { category, top, totalCount };
    })
  );
}

export async function getMostActiveCategories(limit = 8) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentBids = await db.bid.findMany({
    where: { createdAt: { gte: since } },
    select: { listing: { select: { categoryId: true } } },
  });
  const counts = new Map<string, number>();
  for (const bid of recentBids) {
    counts.set(bid.listing.categoryId, (counts.get(bid.listing.categoryId) ?? 0) + 1);
  }
  const categories = await db.category.findMany({ where: { slug: { not: "other" } } });
  return categories
    .map((c) => ({ ...c, recentActivity: counts.get(c.id) ?? 0 }))
    .sort((a, b) => b.recentActivity - a.recentActivity)
    .slice(0, limit);
}

export async function getLatestActivity(limit = 8) {
  const recentBids = await db.bid.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { listing: { include: { category: categorySelect } } },
  });

  return Promise.all(
    recentBids
      .filter((bid) => bid.listing.status === "ACTIVE")
      .map(async (bid) => {
        const rank = await getRankContext(bid.listing);
        return {
          id: bid.id,
          listing: bid.listing,
          amount: bid.listing.currentAmount,
          overallRank: rank.overallRank,
          isNew: bid.resultingTotal === bid.amount,
          createdAt: bid.createdAt,
        };
      })
  );
}

/** Recent "you got overtaken" events for a single listing — the raw feed behind the product-page activity log and the watchlist API. */
export async function getRankEvents(listingId: string, limit = 5) {
  return db.rankEvent.findMany({
    where: { listingId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Batch status lookup for a set of listing slugs — powers the client-side
 * watchlist (localStorage holds the slugs, this resolves their live state)
 * without needing accounts or a server-side "watch" table.
 */
export async function getWatchlistStatus(slugs: string[]) {
  if (slugs.length === 0) return [];
  const listings = await db.listing.findMany({
    where: { slug: { in: slugs } },
    include: { category: categorySelect },
  });

  return Promise.all(
    listings.map(async (listing) => {
      const [rank, latestEvent] = await Promise.all([
        getRankContext(listing),
        db.rankEvent.findFirst({ where: { listingId: listing.id }, orderBy: { createdAt: "desc" } }),
      ]);
      return {
        slug: listing.slug,
        displayName: listing.displayName,
        currentAmount: listing.currentAmount,
        status: listing.status,
        categoryName: listing.category.name,
        overallRank: rank.overallRank,
        overallTotal: rank.overallTotal,
        categoryRank: rank.categoryRank,
        categoryTotal: rank.categoryTotal,
        latestEvent: latestEvent
          ? { overtakenByDisplayName: latestEvent.overtakenByDisplayName, scope: latestEvent.scope, createdAt: latestEvent.createdAt }
          : null,
      };
    })
  );
}

export async function getSiteStats() {
  const [listingCount, totalRevenueAgg, topListing, clickTotal] = await Promise.all([
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.bid.aggregate({ _sum: { amount: true } }),
    db.listing.findFirst({ where: { status: "ACTIVE" }, orderBy: { currentAmount: "desc" } }),
    db.click.count({ where: { isCounted: true } }),
  ]);
  return {
    listingCount,
    totalRevenue: totalRevenueAgg._sum.amount ?? 0,
    highestAmount: topListing?.currentAmount ?? 0,
    totalClicks: clickTotal,
  };
}
