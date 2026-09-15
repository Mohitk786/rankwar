"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <Button type="button" variant="link" size="sm" onClick={resolve} disabled={pending} className="h-auto px-0">
      Mark resolved
    </Button>
  );
}
