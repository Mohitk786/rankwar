import { notFound } from "next/navigation";
import { ArrowUpRight, Award, MousePointerClick, RotateCw, Trophy } from "lucide-react";
import { getListingBySlug, getRankContext } from "@/lib/ranking";
import { generateListingFaq } from "@/lib/seo-copy";
import { formatCount, formatRelativeTime, formatUsd } from "@/lib/format";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { CategoryTag } from "@/components/CategoryTag";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };
  return {
    title: `${listing.displayName} · #${listing.raiseCount > 0 ? "raised" : "new"} on RankWar`,
    description: listing.description ?? `${listing.displayName} on the RankWar leaderboard.`,
    openGraph: listing.imageUrl ? { images: [listing.imageUrl] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || listing.status === "REMOVED") notFound();

  const [rankContext, clickCount] = await Promise.all([
    getRankContext(listing),
    db.click.count({ where: { listingId: listing.id, isCounted: true } }),
  ]);

  const faq = generateListingFaq({
    displayName: listing.displayName,
    currentAmount: listing.currentAmount,
    raiseCount: listing.raiseCount,
    lastPaidAt: listing.lastPaidAt,
    category: listing.category,
    overallRank: rankContext.overallRank,
    overallTotal: rankContext.overallTotal,
    categoryRank: rankContext.categoryRank,
    categoryTotal: rankContext.categoryTotal,
    clickCount,
  });

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/product/${listing.slug}`;
  const isTopSpot = rankContext.overallRank === 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div
        className={`mb-6 rounded-xl border p-5 ${isTopSpot ? "border-accent/50 bg-accent/5" : "border-border bg-surface"}`}
      >
        <div className="flex items-start gap-4">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border">
            {listing.faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.faviconUrl} alt="" width={56} height={56} className="h-full w-full object-contain" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 truncate font-mono text-2xl font-bold">
              {isTopSpot ? <Trophy className="h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} /> : null}
              {listing.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <CategoryTag slug={listing.category.slug} name={listing.category.name} />
              <span>{formatRelativeTime(listing.firstPaidAt)}</span>
            </div>
            {listing.description ? <p className="mt-2 text-sm">{listing.description}</p> : null}
          </div>
          <span className="shrink-0 font-mono text-2xl font-bold text-accent">{formatUsd(listing.currentAmount)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`/go/${listing.slug}`}
            rel="sponsored nofollow"
            className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Visit {listing.type === "X_HANDLE" ? "profile" : "site"}
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <CopyLinkButton url={shareUrl} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Award} label="Category rank" value={`#${rankContext.categoryRank} of ${rankContext.categoryTotal}`} />
        <StatTile icon={Trophy} label="Overall rank" value={`#${rankContext.overallRank} of ${rankContext.overallTotal}`} />
        <StatTile icon={RotateCw} label="Times raised" value={listing.raiseCount.toLocaleString()} />
        <StatTile icon={MousePointerClick} label="Clicks" value={formatCount(clickCount)} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">About this ranking</h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium">{item.question}</h3>
              <p className="text-sm text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <Icon className="mb-1.5 h-4 w-4 text-accent" strokeWidth={2.5} />
      <div className="font-mono text-lg font-bold tabular">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
