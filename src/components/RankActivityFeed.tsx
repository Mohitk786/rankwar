import { AlertTriangle } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

type RankEvent = {
  id: string;
  scope: "OVERALL" | "CATEGORY";
  categoryName: string | null;
  overtakenByDisplayName: string;
  createdAt: Date;
};

export function RankActivityFeed({ events }: { events: RankEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-border p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" /> Recent rank activity
      </h2>
      <ul className="space-y-2 text-sm">
        {events.map((event) => (
          <li key={event.id} className="flex items-baseline justify-between gap-3 text-muted-foreground">
            <span>
              Overtaken by <strong className="text-foreground">{event.overtakenByDisplayName}</strong>
              {event.scope === "CATEGORY" && event.categoryName ? ` in ${event.categoryName}` : " overall"}
            </span>
            <span className="shrink-0 text-xs tabular">{formatRelativeTime(event.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
