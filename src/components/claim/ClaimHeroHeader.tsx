"use client";

import { Minus, Plus } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AnimatedUsd } from "@/components/claim/AnimatedUsd";

export function ClaimHeroHeader({
  title = "Claim #1 for",
  amount,
  minAmount,
  priceToBeat,
  onDecrease,
  onIncrease,
}: {
  title?: string;
  amount: number;
  minAmount: number;
  priceToBeat: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground sm:text-base">
        Just claim your way to #1.
      </p>
      <h1 className="flex flex-col items-center gap-3 font-serif text-4xl font-semibold tracking-tight sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:text-6xl">
        <span>{title}</span>
        <span className="flex items-center gap-3 font-mono font-semibold sm:gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            aria-label="Decrease amount"
            disabled={amount <= 1}
            onClick={onDecrease}
            className="size-11 rounded-full bg-muted text-muted-foreground shadow-none hover:bg-muted/80 sm:size-12"
          >
            <Minus className="size-5" />
          </Button>
          <AnimatedUsd value={amount} className="min-w-[2.8ch] text-primary" />
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            aria-label="Increase amount"
            onClick={onIncrease}
            className="size-11 rounded-full bg-muted text-muted-foreground shadow-none hover:bg-muted/80 sm:size-12"
          >
            <Plus className="size-5" />
          </Button>
        </span>
      </h1>
      <p className="mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
        Start at {formatUsd(minAmount)}. Higher bids get higher positions.{" "}
        {formatUsd(priceToBeat)} takes #1.
      </p>
    </>
  );
}
