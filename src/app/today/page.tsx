import { getTodayBoard, getLatestActivity, getBoardCategories } from "@/lib/ranking";
import { resolveSuggestedAmount } from "@/lib/claim-suggestion";
import { BoardPage } from "@/components/BoardPage";

export const metadata = { title: "Today's leaderboard" };
export const revalidate = 20;

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string; amount?: string }>;
}) {
  const { listing: listingParam, amount: amountParam } = await searchParams;

  const [categories, rows, activity] = await Promise.all([
    getBoardCategories(),
    getTodayBoard({ limit: 100 }),
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
      title="Claim today's #1"
      categories={categories}
      rows={rows}
      activity={activity}
      suggestedAmount={suggestedAmount}
      currentTop={currentTop}
      defaultInput={listingParam ?? ""}
      period="today"
      emptyLabel="No payments in the last 24 hours yet."
    />
  );
}
