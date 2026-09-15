import { ListOrdered, DollarSign, Trophy, MousePointerClick } from "lucide-react";
import { getSiteStats } from "@/lib/ranking";
import { CountUp } from "@/components/CountUp";

export const metadata = { title: "About" };
export const revalidate = 60;

export default async function AboutPage() {
  const stats = await getSiteStats();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-serif text-2xl font-semibold tracking-tight">About Who&apos;s #1</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={ListOrdered} label="Listings" value={stats.listingCount} variant="count" />
        <Stat icon={DollarSign} label="Total paid" value={stats.totalRevenue} variant="usd" />
        <Stat icon={Trophy} label="Highest rank" value={stats.highestAmount} variant="usd" />
        <Stat icon={MousePointerClick} label="Clicks delivered" value={stats.totalClicks} variant="count" />
      </div>

      <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed">
        <p>
          Who&apos;s #1 is one public, permanent leaderboard. Anyone can pay to insert a listing — a product site or an
          X/Twitter handle — at a rank determined purely by how much they&apos;ve paid. No votes, no reviews, no
          algorithm beyond sorting by dollars spent.
        </p>
        <p>
          There&apos;s no login and no dashboard. A listing&apos;s rank is owned by whoever is willing to keep paying
          for it — resubmit the same URL any time to raise your position, and you only ever pay the difference
          between your old total and your new one.
        </p>
        <p>
          Every payment is final. Being outranked isn&apos;t refunded, and it isn&apos;t a bug — someone else simply
          paid more. That&apos;s the entire mechanism, and it&apos;s the entire point.
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  variant: "usd" | "count";
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <Icon className="mb-1.5 h-4 w-4 text-primary" strokeWidth={2.5} />
      <div className="font-mono text-xl font-bold tabular">
        <CountUp value={value} variant={variant} />
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
