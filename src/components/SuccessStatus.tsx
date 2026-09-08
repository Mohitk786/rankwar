"use client";

import { useEffect, useState } from "react";

type Status = "PENDING" | "SUCCEEDED" | "FAILED" | "EXPIRED" | "UNKNOWN" | "INITIATED";

export function SuccessStatus({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<Status>("PENDING");
  const [listingSlug, setListingSlug] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (status === "SUCCEEDED" || status === "FAILED" || status === "EXPIRED") return;
    if (attempts > 30) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        setStatus(data.status);
        if (data.listingSlug) setListingSlug(data.listingSlug);
      } catch {
        // transient network error — the next tick will retry
      }
      setAttempts((a) => a + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, attempts, sessionId]);

  if (status === "SUCCEEDED") {
    return (
      <div>
        <p className="mb-4 text-lg font-medium">You&apos;re live on the board.</p>
        {listingSlug ? (
          <a href={`/product/${listingSlug}`} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            View your listing
          </a>
        ) : null}
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
