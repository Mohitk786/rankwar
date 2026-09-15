import { ClaimHero } from "@/components/claim/ClaimHero";
import { BoardFilters } from "@/components/BoardFilters";
import { BoardTable, type BoardRow } from "@/components/BoardTable";
import {
  LatestActivityTicker,
  type ActivityItem,
} from "@/components/LatestActivityTicker";
import type { ClaimCategory } from "@/components/claim/types";

export function BoardPage({
  title,
  categories,
  rows,
  activity,
  suggestedAmount,
  currentTop,
  defaultInput,
  period,
  emptyLabel,
  isGlobalAllTimeBoard = false,
}: {
  title?: string;
  categories: ClaimCategory[];
  rows: BoardRow[];
  activity: ActivityItem[];
  suggestedAmount: number;
  currentTop: number;
  defaultInput: string;
  period: "all-time" | "today";
  emptyLabel: string;
  isGlobalAllTimeBoard?: boolean;
}) {
  return (
    <>
      <ClaimHero
        title={title}
        categories={categories}
        suggestedAmount={suggestedAmount}
        currentTopAmount={currentTop}
        defaultInput={defaultInput}
        minAmount={10}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-10">
        <BoardFilters categories={categories} period={period} />
        <BoardTable
          rows={rows}
          emptyLabel={emptyLabel}
          isGlobalAllTimeBoard={isGlobalAllTimeBoard}
          insertAfter={5}
          insert={<LatestActivityTicker items={activity} />}
        />
      </div>
    </>
  );
}
