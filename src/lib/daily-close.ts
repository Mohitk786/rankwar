import { db } from "./db";
import { utcDateOnly } from "./ranking";

/**
 * Freezes a UTC calendar day into DailyLeaderboardEntry rows — meant to run
 * once, right after that day ends (wire this up to a daily cron hitting
 * /api/cron/close-daily). Idempotent: re-running for the same date
 * recomputes and overwrites that date's rows rather than duplicating them.
 */
export async function closeDailyBoard(dateStr: string) {
  const dayStart = utcDateOnly(dateStr);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const todayUtc = new Date().toISOString().slice(0, 10);

  if (dateStr >= todayUtc) {
    throw new Error("Can only close a day once it is fully in the past (UTC).");
  }

  const grouped = await db.bid.groupBy({
    by: ["listingId"],
    where: { createdAt: { gte: dayStart, lt: dayEnd } },
    _sum: { amount: true },
  });

  if (grouped.length === 0) return { date: dateStr, entries: 0 };

  const sorted = grouped
    .map((g) => ({ listingId: g.listingId, amount: g._sum.amount ?? 0 }))
    .sort((a, b) => b.amount - a.amount);

  await db.$transaction(
    sorted.map((row, index) =>
      db.dailyLeaderboardEntry.upsert({
        where: { listingId_utcDate: { listingId: row.listingId, utcDate: dayStart } },
        create: {
          listingId: row.listingId,
          utcDate: dayStart,
          amount: row.amount,
          rank: index + 1,
          isFrozen: true,
        },
        update: { amount: row.amount, rank: index + 1, isFrozen: true },
      })
    )
  );

  return { date: dateStr, entries: sorted.length };
}
