import { notFound } from "next/navigation";
import { getDailyBoard } from "@/lib/ranking";
import { formatUtcDateLabel } from "@/lib/format";
import { BoardTable } from "@/components/BoardTable";
import { PageShell } from "@/components/PageShell";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return { title: `${date} leaderboard` };
}

export default async function DailyDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const rows = await getDailyBoard(date);
  if (rows.length === 0) notFound();

  return (
    <PageShell>
      <h1 className="mb-1 font-serif text-2xl font-semibold tracking-tight">
        {formatUtcDateLabel(date)}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Frozen archive — this day&apos;s board no longer changes.
      </p>
      <BoardTable rows={rows} />
    </PageShell>
  );
}
