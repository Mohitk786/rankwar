"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { formatUsd } from "@/lib/format";

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

export function SuccessStatus({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<Status>("PENDING");
  const [win, setWin] = useState<WinData | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "SUCCEEDED" || status === "FAILED" || status === "EXPIRED") return;
    if (attempts > 30) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        setStatus(data.status);
        if (data.status === "SUCCEEDED" && data.listingSlug) setWin(data);
      } catch {
        // transient network error — the next tick will retry
      }
      setAttempts((a) => a + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, attempts, sessionId]);

  if (status === "SUCCEEDED" && win) {
    const isTop = win.overallRank === 1;
    const shareUrl = `${window.location.origin}/product/${win.listingSlug}`;
    const shareText = isTop
      ? `I just took #1 on RankWar in ${win.categoryName} 🏆`
      : `I'm #${win.overallRank} on RankWar (#${win.categoryRank} in ${win.categoryName})`;
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
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-6">
        {isTop ? (
          <Trophy className="mx-auto mb-3 h-10 w-10 text-accent" strokeWidth={2} />
        ) : (
          <div className="mb-3 font-mono text-4xl font-black text-accent">#{win.overallRank}</div>
        )}
        <p className="mb-1 text-lg font-bold">{win.displayName}</p>
        <p className="mb-4 text-sm text-muted">
          #{win.overallRank} of {win.overallTotal} overall · #{win.categoryRank} of {win.categoryTotal} in{" "}
          {win.categoryName}
        </p>
        <p className="mb-5 font-mono text-2xl font-bold text-accent">{formatUsd(win.amount)}</p>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Share on X
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-foreground/40"
          >
            Share on LinkedIn
          </a>
          <button
            type="button"
            onClick={copyResult}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-foreground/40"
          >
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>

        <a href={`/product/${win.listingSlug}`} className="text-sm text-muted underline">
          View your listing
        </a>
      </div>
    );
  }

  if (status === "FAILED" || status === "EXPIRED") {
    return <p className="text-danger">This checkout didn&apos;t complete. No charge was made — try again from the homepage.</p>;
  }

  if (attempts > 30) {
    return (
      <p className="text-muted">
        Still confirming with Stripe — this can occasionally take a minute. Refresh this page shortly, or check the
        board directly.
      </p>
    );
  }

  return <p className="text-muted">Confirming your payment…</p>;
}
