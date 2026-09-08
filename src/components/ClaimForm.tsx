"use client";

import { useState } from "react";
import { AtSign, Globe, Loader2, Rocket, ShieldCheck, Tag, Trophy } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { getCategoryVisual } from "@/lib/category-visuals";

type Category = { slug: string; name: string };

export function ClaimForm({
  categories,
  defaultCategorySlug,
  lockCategory = false,
  suggestedAmount,
  currentTopAmount,
}: {
  categories: Category[];
  defaultCategorySlug?: string;
  lockCategory?: boolean;
  suggestedAmount: number;
  currentTopAmount: number;
}) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [input, setInput] = useState("");
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug ?? categories[0]?.slug ?? "");
  const [amount, setAmount] = useState(suggestedAmount);
  const [tosAgreed, setTosAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryName = categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;
  const CategoryIcon = getCategoryVisual(categorySlug).icon;
  const wouldTakeFirst = currentTopAmount === 0 || amount > currentTopAmount;
  const isHandle = input.trim().startsWith("@");

  function goToConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!input.trim()) {
      setError("Enter a URL or @handle.");
      return;
    }
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Enter a whole-dollar amount.");
      return;
    }
    setStep("confirm");
  }

  async function submit() {
    if (!tosAgreed) {
      setError("You need to agree to the Terms of Service.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, categorySlug, targetAmount: amount, tosAgreed: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 font-mono text-lg font-bold">Confirm this rank</h3>
        <dl className="mb-4 space-y-2.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Listing</dt>
            <dd className="truncate font-medium">{input}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Category</dt>
            <dd className="inline-flex items-center gap-1.5 font-medium">
              <CategoryIcon className="h-3.5 w-3.5 text-muted" strokeWidth={2.5} />
              {categoryName}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2.5">
            <dt className="text-muted">Price (due now)</dt>
            <dd className="font-mono text-xl font-bold text-accent">{formatUsd(amount)}</dd>
          </div>
        </dl>
        <p className="mb-4 flex items-start gap-2 rounded-md bg-background p-3 text-sm text-muted">
          {wouldTakeFirst ? (
            <>
              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
              This puts you at #1 right now — someone else can still outbid you later.
            </>
          ) : (
            "A listing at that rank on the public board. It goes live the moment payment confirms. Someone else can claim a higher rank at any time."
          )}
        </p>
        <label className="mb-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={tosAgreed}
            onChange={(e) => setTosAgreed(e.target.checked)}
            className="mt-0.5 accent-accent"
          />
          <span>
            I have read and agree to the{" "}
            <a href="/terms" target="_blank" className="underline">
              Terms of Service
            </a>
            ,{" "}
            <a href="/privacy" target="_blank" className="underline">
              Privacy Policy
            </a>
            , and{" "}
            <a href="/rules" target="_blank" className="underline">
              Rules
            </a>
            .
          </span>
        </label>
        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-foreground/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !tosAgreed}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Continue to checkout
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={goToConfirm} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3">
        <label className="mb-1 block text-sm text-muted" htmlFor="claim-input">
          Your product URL or @handle
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {isHandle ? <AtSign className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
          </span>
          <input
            id="claim-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="example.com or @yourhandle"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm text-muted" htmlFor="claim-category">
            <Tag className="h-3.5 w-3.5" /> Category
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <CategoryIcon className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <select
              id="claim-category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              disabled={lockCategory}
              className="w-full appearance-none rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent disabled:opacity-70"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm text-muted" htmlFor="claim-amount">
            Amount (whole USD)
          </label>
          <div className="flex items-stretch gap-1">
            <button
              type="button"
              onClick={() => setAmount((a) => Math.max(1, a - 1))}
              className="w-9 shrink-0 rounded-md border border-border text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
              aria-label="Decrease amount"
            >
              −
            </button>
            <input
              id="claim-amount"
              type="number"
              step={1}
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.round(Number(e.target.value)))}
              className="w-full min-w-0 rounded-md border border-border bg-background px-2 py-2 text-center font-mono text-sm outline-none transition-colors focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setAmount((a) => a + 1)}
              className="w-9 shrink-0 rounded-md border border-border text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
              aria-label="Increase amount"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        <Rocket className="h-4 w-4" /> Claim rank
      </button>
    </form>
  );
}
