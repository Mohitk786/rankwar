import type { ReactNode } from "react";
import Link from "next/link";
import { getDailyBoard, getDailyDates, getTodayBoard } from "@/lib/ranking";
import { formatUtcDateLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoardTable, type BoardRow } from "@/components/BoardTable";
import { PageShell } from "@/components/PageShell";

export const metadata = { title: "Daily archive" };
export const revalidate = 60;

function DayPreview({
  label,
  meta,
  rows,
  emptyLabel,
  href,
  actionLabel,
}: {
  label: string;
  meta: ReactNode;
  rows: BoardRow[];
  emptyLabel?: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono font-semibold">{label}</span>
        {meta}
      </div>
      <BoardTable rows={rows} emptyLabel={emptyLabel} showNudge={false} />
      <div className="mt-4 flex justify-center">
        <Button asChild variant="outline" className="shadow-none">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function DailyIndexPage() {
  const dates = await getDailyDates();
  const todayTop3 = (await getTodayBoard({ limit: 3 })) ?? [];
  const pastDays = await Promise.all(
    dates.map(async (d) => ({
      ...d,
      top3: (await getDailyBoard(d.date)).slice(0, 3),
    })),
  );

  return (
    <PageShell>
      <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight">
        Daily archive
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Each UTC day freezes into a permanent snapshot at midnight.
      </p>

      <div className="space-y-6">
        <DayPreview
          label={formatUtcDateLabel(new Date().toISOString().slice(0, 10))}
          meta={<Badge>Live</Badge>}
          rows={todayTop3}
          emptyLabel="No payments yet today."
          href="/today"
          actionLabel="See live board"
        />

        {pastDays.map((day) => (
          <DayPreview
            key={day.date}
            label={formatUtcDateLabel(day.date)}
            meta={
              <span className="text-xs text-muted-foreground">
                {day.count} listed
              </span>
            }
            rows={day.top3}
            href={`/daily/${day.date}`}
            actionLabel="Show all ranks"
          />
        ))}
      </div>
    </PageShell>
  );
}
