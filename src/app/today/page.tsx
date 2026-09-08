import Link from "next/link";
import { db } from "@/lib/db";
import { getTodayBoard } from "@/lib/ranking";
import { CategoryPills } from "@/components/CategoryPills";
import { BoardTable } from "@/components/BoardTable";

export const metadata = { title: "Today's leaderboard" };
export const revalidate = 20;

export default async function TodayPage() {
  const [categories, rows] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    getTodayBoard({ limit: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 font-mono text-2xl font-bold">Today&apos;s leaderboard</h1>
      <p className="mb-6 text-sm text-muted">Rolling 24-hour window — a payment drops off exactly 24h after it was made.</p>

      <nav className="mb-4 flex gap-2 text-sm">
        <Link href="/" className="rounded-full border border-border px-3 py-1 text-muted hover:text-foreground">
          All-time
        </Link>
        <span className="rounded-full border border-accent bg-accent px-3 py-1 font-medium text-accent-foreground">
          Today
        </span>
      </nav>

      <CategoryPills categories={categories} />
      <BoardTable rows={rows} emptyLabel="No payments in the last 24 hours yet." />
    </div>
  );
}
