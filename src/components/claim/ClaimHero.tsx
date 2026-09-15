"use client";

import { useState } from "react";
import { ClaimForm } from "@/components/ClaimForm";
import { ClaimHeroHeader } from "@/components/claim/ClaimHeroHeader";
import type { ClaimCategory } from "@/components/claim/types";

export function ClaimHero({
  title,
  categories,
  suggestedAmount,
  currentTopAmount,
  defaultInput = "",
  minAmount = 10,
}: {
  title?: string;
  categories: ClaimCategory[];
  suggestedAmount: number;
  currentTopAmount: number;
  defaultInput?: string;
  minAmount?: number;
}) {
  const [amount, setAmount] = useState(suggestedAmount);
  const [seenSuggested, setSeenSuggested] = useState(suggestedAmount);
  if (suggestedAmount !== seenSuggested) {
    setSeenSuggested(suggestedAmount);
    setAmount(suggestedAmount);
  }
  const priceToBeat = currentTopAmount === 0 ? minAmount : currentTopAmount + 1;

  return (
    <div
      id="claim"
      className="mx-auto flex w-full max-w-4xl scroll-mt-20 flex-col items-center px-4 py-8 text-center sm:py-12"
    >
      <ClaimHeroHeader
        title={title}
        amount={amount}
        minAmount={minAmount}
        priceToBeat={priceToBeat}
        onDecrease={() => setAmount((value) => Math.max(1, value - 1))}
        onIncrease={() => setAmount((value) => value + 1)}
      />
      <div className="mt-8 w-full max-w-3xl">
        <ClaimForm
          variant="hero"
          categories={categories}
          suggestedAmount={amount}
          amount={amount}
          currentTopAmount={currentTopAmount}
          defaultInput={defaultInput}
        />
      </div>
    </div>
  );
}
