"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Status = "PENDING" | "SUCCEEDED" | "FAILED" | "EXPIRED" | "UNKNOWN" | "INITIATED";

type WinData = {
  listingSlug: string;
  displayName: string;
  categoryName: string;
  amount: number;
  overallRank: number;
  overallTotal: number;
  categoryRank: number;
  categoryTotal: number;
};

export function SuccessStatus({ checkoutId }: { checkoutId: string }) {
  const [status, setStatus] = useState<Status>("PENDING");
  const [win, setWin] = useState<WinData | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "SUCCEEDED" || status === "FAILED" || status === "EXPIRED") return;
    if (attempts > 30) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/checkout/status?checkoutId=${encodeURIComponent(checkoutId)}`);
        const data = await res.json();
        setStatus(data.status);
        if (data.status === "SUCCEEDED" && data.listingSlug) setWin(data);
      } catch {
        // transient network error — the next tick will retry
      }
      setAttempts((a) => a + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, attempts, checkoutId]);

  if (status === "SUCCEEDED" && win) {
    const isTop = win.overallRank === 1;
    const shareUrl = `${window.location.origin}/product/${win.listingSlug}`;
    const shareText = isTop
      ? `I just took #1 on Who's #1 in ${win.categoryName} 🏆`
      : `I'm #${win.overallRank} on Who's #1 (#${win.categoryRank} in ${win.categoryName})`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    async function copyResult() {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // clipboard unavailable — ignore
      }
    }

    return (
      <Card className="gap-0 border-primary/40 bg-primary/5 py-6">
        <CardContent className="text-center">
          {isTop ? (
            <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" strokeWidth={2} />
          ) : (
            <div className="mb-3 font-mono text-4xl font-black text-primary">#{win.overallRank}</div>
          )}
          <p className="mb-1 text-lg font-bold">{win.displayName}</p>
          <p className="mb-4 text-sm text-muted-foreground">
            #{win.overallRank} of {win.overallTotal} overall · #{win.categoryRank} of {win.categoryTotal} in{" "}
            {win.categoryName}
          </p>
          <p className="mb-5 font-mono text-2xl font-bold text-primary">{formatUsd(win.amount)}</p>

          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
                Share on X
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                Share on LinkedIn
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={copyResult}>
              {copied ? "Copied!" : "Copy result"}
            </Button>
          </div>

          <a href={`/product/${win.listingSlug}`} className="text-sm text-muted-foreground underline">
            View your listing
          </a>
        </CardContent>
      </Card>
    );
  }

  if (status === "FAILED" || status === "EXPIRED") {
    return <p className="text-destructive">This checkout didn&apos;t complete. No charge was made — try again from the homepage.</p>;
  }

  if (attempts > 30) {
    return (
      <p className="text-muted-foreground">
        Still confirming with Dodo Payments — this can occasionally take a minute. Refresh this page shortly, or check the
        board directly.
      </p>
    );
  }

  return <p className="text-muted-foreground">Confirming your payment…</p>;
}
