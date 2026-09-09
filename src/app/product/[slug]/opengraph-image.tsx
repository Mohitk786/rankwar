import { ImageResponse } from "next/og";
import { getListingBySlug, getRankContext } from "@/lib/ranking";
import { formatUsd } from "@/lib/format";

export const alt = "Who's #1 ranking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#4ade80";
const BG = "#0b0b09";
const FG = "#f1f0ea";
const MUTED = "#948f80";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: BG, color: FG, alignItems: "center", justifyContent: "center", gap: 12, fontSize: 48, fontWeight: 700 }}>
          <span>Who&apos;s</span>
          <span style={{ color: ACCENT }}>#1</span>
        </div>
      ),
      size
    );
  }

  const rank = await getRankContext(listing);
  const isTop = rank.overallRank === 1;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: BG,
          color: FG,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, fontSize: 36, fontWeight: 700 }}>
            <span>Who&apos;s</span>
            <span style={{ color: ACCENT }}>#1</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 28,
              color: isTop ? "#0b0b09" : ACCENT,
              background: isTop ? ACCENT : "transparent",
              border: isTop ? "none" : `2px solid ${ACCENT}`,
              borderRadius: 999,
              padding: "10px 28px",
              fontWeight: 700,
            }}
          >
            {isTop ? "🏆 #1 OVERALL" : `#${rank.overallRank} OF ${rank.overallTotal}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 26, color: MUTED }}>{listing.category.name}</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
            {listing.displayName}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 16 }}>
            <div style={{ display: "flex", fontSize: 88, fontWeight: 800, color: ACCENT }}>
              {formatUsd(listing.currentAmount)}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: MUTED }}>paid to rank here</div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: MUTED }}>
          #{rank.categoryRank} in {listing.category.name} · who&apos;s #1
        </div>
      </div>
    ),
    size
  );
}
