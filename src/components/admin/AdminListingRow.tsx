"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatUsd } from "@/lib/format";

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
        <select
          value={listing.category.slug}
          disabled={pending}
          onChange={(e) => patch({ categorySlug: e.target.value })}
          className="rounded border border-border bg-background px-1 py-0.5 text-xs"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3">
        <select
          value={listing.status}
          disabled={pending}
          onChange={(e) => patch({ status: e.target.value })}
          className="rounded border border-border bg-background px-1 py-0.5 text-xs"
        >
          <option value="ACTIVE">Active</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="REMOVED">Removed</option>
        </select>
      </td>
      <td className="py-2 text-right">
        <button onClick={remove} disabled={pending} className="text-xs text-danger hover:underline">
          Remove
        </button>
      </td>
    </tr>
  );
}
