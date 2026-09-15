import { getAllTimeBoard, getLatestActivity, getBoardCategories } from "@/lib/ranking";
import { resolveSuggestedAmount } from "@/lib/claim-suggestion";
import { BoardPage } from "@/components/BoardPage";

export const revalidate = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string; amount?: string }>;
}) {
  const { listing: listingParam, amount: amountParam } = await searchParams;

  const [categories, rows, activity] = await Promise.all([
    getBoardCategories(),
    getAllTimeBoard({ limit: 100 }),
    getLatestActivity(8),
  ]);

  const currentTop = rows[0]?.amount ?? 0;
  const suggestedAmount = await resolveSuggestedAmount(
    currentTop,
    listingParam,
    amountParam,
  );

  return (
    <BoardPage
      categories={categories}
      rows={rows}
      activity={activity}
      suggestedAmount={suggestedAmount}
      currentTop={currentTop}
      defaultInput={listingParam ?? ""}
      period="all-time"
      emptyLabel="No listings yet — be the first to claim a rank."
      isGlobalAllTimeBoard
    />
  );
}
