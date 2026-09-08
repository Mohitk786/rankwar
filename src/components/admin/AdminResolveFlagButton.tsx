"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminResolveFlagButton({ flagId }: { flagId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function resolve() {
    setPending(true);
    await fetch(`/api/admin/moderation/${flagId}`, { method: "PATCH" });
    router.refresh();
    setPending(false);
  }

  return (
    <button onClick={resolve} disabled={pending} className="text-xs text-accent hover:underline">
      Mark resolved
    </button>
  );
}
