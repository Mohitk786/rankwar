import { getCategoryVisual } from "@/lib/category-visuals";

export function CategoryTag({
  slug,
  name,
  size = "sm",
  className = "",
}: {
  slug: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { icon: Icon } = getCategoryVisual(slug);
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-card font-medium text-muted-foreground ring-1 ring-border ${padding} ${className}`}
    >
      <Icon className={iconSize} strokeWidth={2.5} />
      {name}
    </span>
  );
}
