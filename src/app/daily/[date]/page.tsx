import { notFound } from "next/navigation";
import { getDailyBoard } from "@/lib/ranking";
import { BoardTable } from "@/components/BoardTable";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return { title: `${date} leaderboard` };
}

export default async function DailyDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const rows = await getDailyBoard(date);
  if (rows.length === 0) notFound();

  const label = new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 font-mono text-2xl font-bold">{label}</h1>
      <p className="mb-6 text-sm text-muted">Frozen archive — this day&apos;s board no longer changes.</p>
      <BoardTable rows={rows} />
    </div>
  );
}
