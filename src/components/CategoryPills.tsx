import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { getCategoryVisual } from "@/lib/category-visuals";

export function CategoryPills({
  categories,
  activeSlug,
}: {
  categories: { slug: string; name: string }[];
  activeSlug?: string;
}) {
  return (
    <div className="mb-4 flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <Link
        href="/"
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
          !activeSlug
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border text-muted hover:border-foreground/30 hover:text-foreground"
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.5} />
        All
      </Link>
      {categories.map((c) => {
        const { icon: Icon } = getCategoryVisual(c.slug);
        const isActive = activeSlug === c.slug;
        return (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
