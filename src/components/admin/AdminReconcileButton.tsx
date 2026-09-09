"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReconcileButton({ checkoutId }: { checkoutId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function check() {
    setPending(true);
    setMessage(null);
    const res = await fetch(`/api/admin/reconcile/${checkoutId}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setMessage(data.error ?? "Failed to check.");
      return;
    }
    setMessage(data.applied ? "Applied — listing updated." : `Dodo Payments status: ${data.paymentStatus}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={check}
        disabled={pending}
        className="rounded border border-border px-2 py-1 text-xs hover:border-foreground/40"
      >
        {pending ? "Checking…" : "Check with Dodo Payments"}
      </button>
      {message ? <span className="text-xs text-muted">{message}</span> : null}
    </div>
  );
}
