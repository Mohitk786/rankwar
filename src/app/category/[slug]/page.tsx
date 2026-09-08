import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAllTimeBoard, getTodayBoard } from "@/lib/ranking";
import { TAKE_FIRST_PLACE_MARGIN } from "@/lib/pricing";
import { CategoryPills } from "@/components/CategoryPills";
import { BoardTable } from "@/components/BoardTable";
import { ClaimForm } from "@/components/ClaimForm";
import { getCategoryVisual, categoryTagStyle } from "@/lib/category-visuals";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  return { title: category ? `${category.name} leaderboard` : "Category not found" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ board?: string }>;
}) {
  const { slug } = await params;
  const { board } = await searchParams;
  const isToday = board === "today";

  const [category, categories] = await Promise.all([
    db.category.findUnique({ where: { slug } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);
  if (!category) notFound();

  const rows = isToday ? await getTodayBoard({ categorySlug: slug, limit: 100 }) : await getAllTimeBoard({ categorySlug: slug, limit: 100 });
  const currentTop = rows[0]?.amount ?? 0;
  const priceToBeat = currentTop === 0 ? 10 : currentTop + TAKE_FIRST_PLACE_MARGIN;
  const { icon: CategoryIcon } = getCategoryVisual(slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2.5 font-mono text-2xl font-bold">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={categoryTagStyle(slug)}>
          <CategoryIcon className="h-5 w-5" strokeWidth={2.5} />
        </span>
        {category.name}
      </h1>
      <p className="mb-6 text-sm text-muted">{category.description}</p>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <nav className="mb-4 flex gap-2 text-sm">
            <Link
              href={`/category/${slug}`}
              className={`rounded-full border px-3 py-1 ${!isToday ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted hover:text-foreground"}`}
            >
              All-time
            </Link>
            <Link
              href={`/category/${slug}?board=today`}
              className={`rounded-full border px-3 py-1 ${isToday ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted hover:text-foreground"}`}
            >
              Today
            </Link>
          </nav>
          <CategoryPills categories={categories} activeSlug={slug} />
          <BoardTable rows={rows} emptyLabel="No listings in this category yet." />
        </div>
        <div>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted">
            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={2.5} /> Claim #1 in {category.name}
          </h2>
          <ClaimForm
            categories={categories}
            defaultCategorySlug={slug}
            lockCategory
            suggestedAmount={priceToBeat}
            currentTopAmount={currentTop}
          />
        </div>
      </div>
    </div>
  );
}
