"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ClaimConfirmDialog({
  open,
  onOpenChange,
  submitting,
  listing,
  categoryName,
  amount,
  wouldTakeFirst,
  tosAgreed,
  onTosChange,
  error,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  listing: string;
  categorySlug: string;
  categoryName: string;
  amount: number;
  wouldTakeFirst: boolean;
  tosAgreed: boolean;
  onTosChange: (agreed: boolean) => void;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Confirm this rank</DialogTitle>
          <DialogDescription>
            Check the rank and price, then agree to the Terms of Service to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start justify-between gap-6 rounded-md bg-muted px-5 py-4 text-left">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">RANK</p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-primary">
              {wouldTakeFirst ? "#1" : "Below #1"}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {listing} | {categoryName}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">PRICE</p>
            <p className="mt-2 font-mono text-xl font-semibold tracking-tight">{formatUsd(amount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Due now</p>
          </div>
        </div>

        <p className="text-left text-sm text-muted-foreground">
          {wouldTakeFirst
            ? "This puts you at #1 on the public board. It goes live when payment confirms. Someone else can still outbid you later."
            : "A listing at that rank on the public board. It goes live when payment confirms. Someone else can claim a higher rank at any time."}
        </p>

        <div className="space-y-2 text-left text-sm">
          <div className="flex items-start gap-2">
            <Checkbox
              id="tos"
              checked={tosAgreed}
              onCheckedChange={(checked) => onTosChange(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="tos" className="font-normal leading-snug">
              I have read and agree to the{" "}
              <a href="/terms" target="_blank" className="text-primary underline">
                Terms of Service
              </a>{" "}
              of whos1.bid
            </Label>
          </div>
          <p className="pl-6 text-muted-foreground">
            <a href="/privacy" target="_blank" className="underline-offset-2 hover:underline">
              Privacy
            </a>
            {" · "}
            <a href="/rules" target="_blank" className="underline-offset-2 hover:underline">
              Rules
            </a>
          </p>
        </div>

        {error ? <p className="text-left text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" className="sm:flex-1" onClick={onSubmit} disabled={submitting || !tosAgreed}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Redirecting to checkout…
              </>
            ) : (
              <>
                <ShieldCheck /> Continue to checkout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
