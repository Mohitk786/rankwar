"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
      <Button type="button" variant="outline" size="xs" onClick={check} disabled={pending}>
        {pending ? "Checking…" : "Check with Dodo Payments"}
      </Button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}
