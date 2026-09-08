import "dotenv/config";
import { db } from "../src/lib/db";
import { CATEGORIES } from "../src/lib/categories";
import { closeDailyBoard } from "../src/lib/daily-close";

const LAUNCH_DATE = new Date("2026-08-18T00:00:00.000Z");

const NAME_PREFIXES = [
  "Pulse", "Nova", "Vertex", "Flux", "Orbit", "Quanta", "Nimbus", "Cascade",
  "Ember", "Beacon", "Drift", "Lattice", "Summit", "Anchor", "Ripple", "Halo",
  "Forge", "Loop", "Spark", "Crest", "Delta", "Cobalt", "Fathom", "Marrow",
  "Slate", "Tandem", "Vantage", "Wander", "Zephyr", "Kindle",
];
const NAME_SUFFIXES = [
  "ly", "io", "hub", "stack", "base", "kit", "flow", "wave", "form", "grid",
  "sync", "path", "works", "labs", "desk", "loop", "line", "board",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]!;
}

function makeProductName(usedNames: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `${pick(NAME_PREFIXES)}${pick(NAME_SUFFIXES)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  const fallback = `${pick(NAME_PREFIXES)}${pick(NAME_SUFFIXES)}${randomInt(2, 99)}`;
  usedNames.add(fallback);
  return fallback;
}

function slugifyDomain(name: string): string {
  return `${name.toLowerCase()}.com`;
}

/** Splits `total` into `parts` positive integers that sum to it. */
function splitIntoParts(total: number, parts: number): number[] {
  if (parts === 1) return [total];
  const cuts = new Set<number>();
  while (cuts.size < parts - 1) {
    cuts.add(randomInt(1, total - 1));
  }
  const sorted = [0, ...Array.from(cuts).sort((a, b) => a - b), total];
  const result: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    result.push(sorted[i + 1]! - sorted[i]!);
  }
  return result.map((n) => Math.max(1, n));
}

function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("Seeding categories...");
  const categoryRecords = new Map<string, { id: string }>();
  for (const [index, cat] of CATEGORIES.entries()) {
    const record = await db.category.upsert({
      where: { slug: cat.slug },
      create: { slug: cat.slug, name: cat.name, description: cat.description, sortOrder: index },
      update: { name: cat.name, description: cat.description, sortOrder: index },
    });
    categoryRecords.set(cat.slug, record);
  }

  const existingListingCount = await db.listing.count();
  const seedSyntheticListings = process.env.SEED_SYNTHETIC_LISTINGS === "true";

  if (existingListingCount > 0) {
    console.log(`Database already has ${existingListingCount} listings — skipping listing seed.`);
  } else if (!seedSyntheticListings) {
    console.log("Skipping synthetic demo listings (set SEED_SYNTHETIC_LISTINGS=true to generate them for local dev).");
  } else {
    const usedNames = new Set<string>();
    const now = new Date();
    let checkoutCounter = 0;

    for (const cat of CATEGORIES) {
      if (cat.slug === "other") continue;
      const listingCount = randomInt(3, 6);
      const categoryRecord = categoryRecords.get(cat.slug)!;

      for (let i = 0; i < listingCount; i++) {
        const name = makeProductName(usedNames);
        const domain = slugifyDomain(name);
        const isTopOfCategory = i === 0 && Math.random() < 0.35;
        const finalAmount = isTopOfCategory
          ? randomInt(800, 17000)
          : randomInt(10, 900);
        const raiseCount = randomInt(0, 3);
        const parts = splitIntoParts(finalAmount, raiseCount + 1);

        const firstPaidAt = randomDateBetween(LAUNCH_DATE, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
        let cursor = firstPaidAt;
        let runningTotal = 0;

        const listing = await db.listing.create({
          data: {
            type: "WEBSITE",
            normalizedKey: domain,
            slug: name.toLowerCase(),
            destinationUrl: `https://${domain}`,
            displayName: name,
            description: `${name} — ${cat.description.replace(/\.$/, "").toLowerCase()}.`,
            imageUrl: null,
            faviconUrl: `/api/icon-image?url=${encodeURIComponent(`https://${domain}`)}`,
            categoryId: categoryRecord.id,
            currentAmount: 0,
            raiseCount: 0,
            firstPaidAt,
            lastPaidAt: firstPaidAt,
          },
        });

        for (const amount of parts) {
          runningTotal += amount;
          checkoutCounter += 1;
          const checkout = await db.checkout.create({
            data: {
              stripeSessionId: `seed_cs_${listing.id}_${checkoutCounter}`,
              stripePaymentIntentId: `seed_pi_${listing.id}_${checkoutCounter}`,
              visitorId: `seed-visitor-${randomInt(1, 500)}`,
              listingType: "WEBSITE",
              targetListingKey: domain,
              targetDestinationUrl: `https://${domain}`,
              targetDisplayName: name,
              targetCategoryId: categoryRecord.id,
              targetAmount: runningTotal,
              deltaAmount: amount,
              status: "SUCCEEDED",
              tosAgreedAt: cursor,
              createdAt: cursor,
              expiresAt: new Date(cursor.getTime() + 60 * 60 * 1000),
            },
          });

          await db.bid.create({
            data: {
              listingId: listing.id,
              amount,
              resultingTotal: runningTotal,
              checkoutId: checkout.id,
              createdAt: cursor,
            },
          });

          cursor = randomDateBetween(cursor, now);
        }

        await db.listing.update({
          where: { id: listing.id },
          data: { currentAmount: runningTotal, raiseCount, lastPaidAt: cursor > now ? now : cursor },
        });

        const clickCount = randomInt(0, Math.round(runningTotal * 1.5));
        if (clickCount > 0) {
          const clickBatch = Array.from({ length: Math.min(clickCount, 300) }, () => ({
            listingId: listing.id,
            visitorId: `seed-visitor-${randomInt(1, 2000)}`,
            ipHash: `seed-ip-${randomInt(1, 5000)}`,
            isCounted: true,
            createdAt: randomDateBetween(firstPaidAt, now),
          }));
          await db.click.createMany({ data: clickBatch });
        }
      }
    }
    console.log("Seeded listings, bids, checkouts, and clicks.");
  }

  if (seedSyntheticListings && existingListingCount === 0) {
    console.log("Closing past daily boards...");
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    for (
      let d = new Date(LAUNCH_DATE);
      d.toISOString().slice(0, 10) < todayStr;
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const dateStr = d.toISOString().slice(0, 10);
      try {
        const result = await closeDailyBoard(dateStr);
        if (result.entries > 0) console.log(`  closed ${dateStr}: ${result.entries} entries`);
      } catch (err) {
        console.error(`  failed to close ${dateStr}:`, err);
      }
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
