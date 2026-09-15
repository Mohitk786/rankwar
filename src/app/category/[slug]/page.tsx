import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAllTimeBoard, getTodayBoard, getBoardCategories } from "@/lib/ranking";
import { emptyBoardPrice } from "@/lib/claim-suggestion";
import { BoardFilters } from "@/components/BoardFilters";
import { BoardTable } from "@/components/BoardTable";
import { ClaimForm } from "@/components/ClaimForm";
import { getCategoryVisual } from "@/lib/category-visuals";
import { PageShell } from "@/components/PageShell";

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
    getBoardCategories(),
  ]);
  if (!category) notFound();

  const rows = isToday ? await getTodayBoard({ categorySlug: slug, limit: 100 }) : await getAllTimeBoard({ categorySlug: slug, limit: 100 });
  const currentTop = rows[0]?.amount ?? 0;
  const priceToBeat = emptyBoardPrice(currentTop);
  const { icon: CategoryIcon } = getCategoryVisual(slug);

  return (
    <PageShell className="relative z-10">
      <h1 className="mb-1 flex items-center gap-2.5 font-serif text-2xl font-semibold tracking-tight">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border">
          <CategoryIcon className="h-5 w-5" strokeWidth={2.5} />
        </span>
        {category.name}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">{category.description}</p>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <BoardFilters categories={categories} activeSlug={slug} period={isToday ? "today" : "all-time"} />
          <BoardTable rows={rows} emptyLabel="No listings in this category yet." />
        </div>
        <div>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
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
    </PageShell>
  );
}
