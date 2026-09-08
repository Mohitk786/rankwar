import Link from "next/link";
import { Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { getAllTimeBoard, getLatestActivity } from "@/lib/ranking";
import { TAKE_FIRST_PLACE_MARGIN } from "@/lib/pricing";
import { ClaimForm } from "@/components/ClaimForm";
import { CategoryPills } from "@/components/CategoryPills";
import { BoardTable } from "@/components/BoardTable";
import { LatestActivityTicker } from "@/components/LatestActivityTicker";
import { formatUsd } from "@/lib/format";

export const revalidate = 20;

export default async function HomePage() {
  const [categories, rows, activity] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    getAllTimeBoard({ limit: 100 }),
    getLatestActivity(8),
  ]);

  const currentTop = rows[0]?.amount ?? 0;
  const priceToBeat = currentTop === 0 ? 10 : currentTop + TAKE_FIRST_PLACE_MARGIN;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <h1 className="mb-2 flex items-center gap-3 font-mono text-4xl font-black tracking-tight sm:text-5xl">
            <Trophy className="h-9 w-9 shrink-0 text-accent sm:h-11 sm:w-11" strokeWidth={2.25} />
            <span>
              Claim #1 for{" "}
              <span className="text-accent">{formatUsd(priceToBeat)}</span>
            </span>
          </h1>
          <p className="mb-1 text-muted">
            Rank is what you pay — nothing else. One public, permanent leaderboard. No algorithm, no ads, no votes.
          </p>
          <p className="text-sm text-muted">
            Already listed?{" "}
            <span className="text-foreground">Resubmit the same URL to raise your rank — you only pay the difference.</span>
          </p>
        </div>
        <ClaimForm categories={categories} suggestedAmount={priceToBeat} currentTopAmount={currentTop} />
      </section>

      <nav className="mb-4 flex gap-2 text-sm">
        <span className="rounded-full border border-accent bg-accent px-3 py-1 font-medium text-accent-foreground">
          All-time
        </span>
        <Link href="/today" className="rounded-full border border-border px-3 py-1 text-muted transition-colors hover:text-foreground">
          Today
        </Link>
      </nav>

      <CategoryPills categories={categories} />

      <LatestActivityTicker items={activity} />

      <BoardTable rows={rows} emptyLabel="No listings yet — be the first to claim a rank." isGlobalAllTimeBoard />
    </div>
  );
}
