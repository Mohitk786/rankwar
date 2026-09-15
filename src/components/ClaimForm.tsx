"use client";

import { useState } from "react";
import { ClaimConfirmDialog } from "@/components/claim/ClaimConfirmDialog";
import { ClaimFormFields } from "@/components/claim/ClaimFormFields";
import type { ClaimCategory } from "@/components/claim/types";

export function ClaimForm({
  categories,
  defaultCategorySlug,
  lockCategory = false,
  suggestedAmount,
  amount: amountProp,
  currentTopAmount,
  defaultInput = "",
  variant = "default",
}: {
  categories: ClaimCategory[];
  defaultCategorySlug?: string;
  lockCategory?: boolean;
  suggestedAmount: number;
  amount?: number;
  currentTopAmount: number;
  defaultInput?: string;
  variant?: "hero" | "default";
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [input, setInput] = useState(defaultInput);
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug ?? "");
  const [tosAgreed, setTosAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amount = amountProp ?? suggestedAmount;
  const categoryName = categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;

  function goToConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!input.trim()) {
      setError("Enter a URL or @handle.");
      return;
    }
    if (!categorySlug) {
      setError("Choose a category.");
      return;
    }
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Enter a whole-dollar amount.");
      return;
    }
    setConfirmError(null);
    setTosAgreed(false);
    setConfirmOpen(true);
  }

  function closeConfirm(open: boolean) {
    if (submitting) return;
    setConfirmOpen(open);
    if (!open) {
      setTosAgreed(false);
      setConfirmError(null);
    }
  }

  async function submit() {
    if (!tosAgreed) {
      setConfirmError("You need to agree to the Terms of Service.");
      return;
    }
    setSubmitting(true);
    setConfirmError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, categorySlug, targetAmount: amount, tosAgreed: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setConfirmError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <ClaimFormFields
        variant={variant}
        input={input}
        onInputChange={setInput}
        lockCategory={lockCategory}
        showCategorySelect={!lockCategory && input.trim().length > 0}
        categories={categories}
        categorySlug={categorySlug}
        categoryName={categoryName}
        onCategoryChange={setCategorySlug}
        onSubmit={goToConfirm}
      />
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <p className="mt-3 text-sm text-muted-foreground">
        Already on the list? Enter the same URL or @handle and up your bid to get back to the top.
      </p>
      <ClaimConfirmDialog
        open={confirmOpen}
        onOpenChange={closeConfirm}
        submitting={submitting}
        listing={input}
        categorySlug={categorySlug}
        categoryName={categoryName}
        amount={amount}
        wouldTakeFirst={currentTopAmount === 0 || amount > currentTopAmount}
        tosAgreed={tosAgreed}
        onTosChange={setTosAgreed}
        error={confirmError}
        onSubmit={submit}
      />
    </div>
  );
}
