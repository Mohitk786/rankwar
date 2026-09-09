// Shared mark used by icon.tsx and apple-icon.tsx (rendered via next/og ImageResponse,
// so this stays inside Satori's supported flexbox subset — no raw <svg>).
const BADGE_BG = "#0b0b09";
const BAR_MUTED = "rgba(241, 240, 234, 0.85)";
const BAR_DIM = "rgba(241, 240, 234, 0.45)";
const BAR_ACCENT = "#4ade80";

function bar(height: number, width: number, color: string) {
  return (
    <div
      style={{
        display: "flex",
        width,
        height,
        background: color,
        borderRadius: Math.max(1, width * 0.4),
      }}
    />
  );
}

export function BrandMark({ size }: { size: number }) {
  const padding = Math.round(size * 0.22);
  const inner = size - padding * 2;
  const barWidth = Math.max(2, Math.round(size * 0.15));
  const gap = Math.round(size * 0.1);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap,
        background: BADGE_BG,
        borderRadius: Math.round(size * 0.26),
        padding,
      }}
    >
      {bar(Math.round(inner * 0.36), barWidth, BAR_DIM)}
      {bar(Math.round(inner * 0.62), barWidth, BAR_MUTED)}
      {bar(Math.round(inner * 0.9), barWidth, BAR_ACCENT)}
    </div>
  );
}
