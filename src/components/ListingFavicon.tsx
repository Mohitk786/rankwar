import { cn } from "@/lib/utils";

export function ListingFavicon({
  src,
  size = 36,
  className,
}: {
  src: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
        />
      ) : null}
    </span>
  );
}
