"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Listing = {
  id: string;
  slug: string;
  displayName: string;
  currentAmount: number;
  status: "ACTIVE" | "UNDER_REVIEW" | "REMOVED";
  category: { slug: string; name: string };
};

export function AdminListingRow({ listing, categories }: { listing: Listing; categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function patch(body: Record<string, string>) {
    setPending(true);
    await fetch(`/api/admin/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
    setPending(false);
  }

  async function remove() {
    if (!confirm(`Remove "${listing.displayName}" from all boards?`)) return;
    setPending(true);
    await fetch(`/api/admin/listings/${listing.id}`, { method: "DELETE" });
    router.refresh();
    setPending(false);
  }

  return (
    <tr className="border-t border-border">
      <td className="py-2 pr-3">
        <a href={`/product/${listing.slug}`} target="_blank" className="underline">
          {listing.displayName}
        </a>
      </td>
      <td className="py-2 pr-3 font-mono">{formatUsd(listing.currentAmount)}</td>
      <td className="py-2 pr-3">
        <Select
          value={listing.category.slug}
          disabled={pending}
          onValueChange={(value) => patch({ categorySlug: value })}
        >
          <SelectTrigger size="sm" className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 pr-3">
        <Select
          value={listing.status}
          disabled={pending}
          onValueChange={(value) => patch({ status: value })}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
            <SelectItem value="REMOVED">Removed</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 text-right">
        <Button variant="link" size="sm" onClick={remove} disabled={pending} className="h-auto px-0 text-destructive">
          Remove
        </Button>
      </td>
    </tr>
  );
}
