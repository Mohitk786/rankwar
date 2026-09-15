import { notFound } from "next/navigation";
import { ArrowUpRight, Award, MousePointerClick, RotateCw, TrendingUp, Trophy } from "lucide-react";
import { getLadder, getListingBySlug, getRankContext, getRankEvents } from "@/lib/ranking";
import { generateListingFaq } from "@/lib/seo-copy";
import { formatCount, formatRelativeTime, formatUsd } from "@/lib/format";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { CategoryTag } from "@/components/CategoryTag";
import { WatchButton } from "@/components/WatchButton";
import { RankActivityFeed } from "@/components/RankActivityFeed";
import { ListingFavicon } from "@/components/ListingFavicon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };
  const rank = await getRankContext(listing);
  return {
    title: `${listing.displayName} · #${rank.overallRank} on Who's #1`,
    description: listing.description ?? `${listing.displayName} — #${rank.overallRank} overall on the Who's #1 leaderboard.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || listing.status === "REMOVED") notFound();

  const [rankContext, clickCount, ladder, rankEvents] = await Promise.all([
    getRankContext(listing),
    db.click.count({ where: { listingId: listing.id, isCounted: true } }),
    getLadder(listing),
    getRankEvents(listing.id),
  ]);

  const raiseInput = listing.type === "X_HANDLE" ? listing.normalizedKey : listing.destinationUrl;

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

  const shareUrl = `${getSiteUrl()}/product/${listing.slug}`;
  const isTopSpot = rankContext.overallRank === 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card className={`mb-6 gap-0 py-5 ${isTopSpot ? "border-primary/50 bg-primary/5" : ""}`}>
        <CardContent className="px-5">
        <div className="flex items-start gap-4">
          <ListingFavicon src={listing.faviconUrl} size={56} className="bg-background" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 truncate font-serif text-2xl font-semibold tracking-tight">
              {isTopSpot ? <Trophy className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.5} /> : null}
              {listing.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <CategoryTag slug={listing.category.slug} name={listing.category.name} />
              <span>{formatRelativeTime(listing.firstPaidAt)}</span>
            </div>
            {listing.description ? <p className="mt-2 text-sm">{listing.description}</p> : null}
          </div>
          <span className="shrink-0 font-mono text-2xl font-bold text-primary">{formatUsd(listing.currentAmount)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`/go/${listing.slug}`} rel="sponsored nofollow">
              Visit {listing.type === "X_HANDLE" ? "profile" : "site"}
              <ArrowUpRight />
            </a>
          </Button>
          <CopyLinkButton url={shareUrl} />
          <Button asChild variant="outline">
            <a href={`/?listing=${encodeURIComponent(raiseInput)}#claim-input`}>
              <TrendingUp />
              Raise your rank
            </a>
          </Button>
          <WatchButton slug={listing.slug} />
        </div>
        </CardContent>
      </Card>

      <RankActivityFeed events={rankEvents} />

      <div className="mb-6 rounded-xl border border-border p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" /> What it costs to move up
        </h2>
        {ladder.isTop ? (
          <p className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>{listing.displayName}</strong> is #1 overall right now — nothing to beat.
            </span>
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {ladder.nextUp ? (
              <p>
                Beat <strong>{ladder.nextUp.name}</strong> for{" "}
                <a
                  href={`/?listing=${encodeURIComponent(raiseInput)}#claim-input`}
                  className="font-mono font-bold text-primary underline decoration-dotted underline-offset-2"
                >
                  {formatUsd(ladder.nextUp.priceToBeat)}
                </a>
              </p>
            ) : null}
            {ladder.topOverall ? (
              <p>
                Take #1 overall (<strong>{ladder.topOverall.name}</strong>) for{" "}
                <a
                  href={`/?listing=${encodeURIComponent(raiseInput)}#claim-input`}
                  className="font-mono font-bold text-primary underline decoration-dotted underline-offset-2"
                >
                  {formatUsd(ladder.topOverall.priceToBeat)}
                </a>
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Award} label="Category rank" value={`#${rankContext.categoryRank} of ${rankContext.categoryTotal}`} />
        <StatTile icon={Trophy} label="Overall rank" value={`#${rankContext.overallRank} of ${rankContext.overallTotal}`} />
        <StatTile icon={RotateCw} label="Times raised" value={listing.raiseCount.toLocaleString()} />
        <StatTile icon={MousePointerClick} label="Clicks" value={formatCount(clickCount)} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">About this ranking</h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium">{item.question}</h3>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
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
      <Icon className="mb-1.5 h-4 w-4 text-primary" strokeWidth={2.5} />
      <div className="font-mono text-lg font-bold tabular">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
