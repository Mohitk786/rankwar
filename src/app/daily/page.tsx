import Link from "next/link";
import { getDailyBoard, getDailyDates, getTodayBoard } from "@/lib/ranking";
import { formatUsd } from "@/lib/format";

export const metadata = { title: "Daily archive" };
export const revalidate = 60;

function formatDateLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function DailyIndexPage() {
  const dates = await getDailyDates();
  const todayTop3 = (await getTodayBoard({ limit: 3 })) ?? [];
  const pastDays = await Promise.all(
    dates.map(async (d) => ({ ...d, top3: (await getDailyBoard(d.date)).slice(0, 3) }))
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 font-mono text-2xl font-bold">Daily archive</h1>
      <p className="mb-6 text-sm text-muted">Each UTC day freezes into a permanent snapshot at midnight.</p>

      <div className="space-y-3">
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono font-semibold">{formatDateLabel(new Date().toISOString().slice(0, 10))}</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Live</span>
          </div>
          {todayTop3.length === 0 ? (
            <p className="text-sm text-muted">No payments yet today.</p>
          ) : (
            <ol className="mb-2 space-y-1 text-sm">
              {todayTop3.map((l, i) => (
                <li key={l.id} className="flex justify-between">
                  <span className="truncate text-muted">
                    {i + 1}. {l.displayName}
                  </span>
                  <span className="font-mono text-accent">{formatUsd(l.amount)}</span>
                </li>
              ))}
            </ol>
          )}
          <Link href="/today" className="text-sm underline">
            See live board
          </Link>
        </div>

        {pastDays.map((day) => (
          <div key={day.date} className="rounded-lg border border-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono font-semibold">{formatDateLabel(day.date)}</span>
              <span className="text-xs text-muted">{day.count} listed</span>
            </div>
            <ol className="mb-2 space-y-1 text-sm">
              {day.top3.map((l, i) => (
                <li key={l.id} className="flex justify-between">
                  <span className="truncate text-muted">
                    {i + 1}. {l.displayName}
                  </span>
                  <span className="font-mono text-accent">{formatUsd(l.amount)}</span>
                </li>
              ))}
            </ol>
            <Link href={`/daily/${day.date}`} className="text-sm underline">
              Show all ranks
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
