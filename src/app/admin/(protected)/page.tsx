import { db } from "@/lib/db";
import { getSiteStats } from "@/lib/ranking";
import { formatCount, formatRelativeTime, formatUsd, minutesAgo } from "@/lib/format";
import { AdminListingRow } from "@/components/admin/AdminListingRow";
import { AdminReconcileButton } from "@/components/admin/AdminReconcileButton";
import { AdminResolveFlagButton } from "@/components/admin/AdminResolveFlagButton";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [stats, stuckCheckouts, stuckEvents, listings, categories, flags] = await Promise.all([
    getSiteStats(),
    db.checkout.findMany({
      where: { status: { in: ["INITIATED", "PENDING"] }, expiresAt: { lt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.paymentEvent.findMany({
      where: { status: "RECEIVED", receivedAt: { lt: minutesAgo(5) } },
      orderBy: { receivedAt: "desc" },
      take: 20,
    }),
    db.listing.findMany({
      where: q ? { displayName: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { category: { select: { slug: true, name: true } } },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    db.moderationFlag.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { displayName: true, slug: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Listings" value={formatCount(stats.listingCount)} />
        <Stat label="Total paid" value={formatUsd(stats.totalRevenue)} />
        <Stat label="Highest rank" value={formatUsd(stats.highestAmount)} />
        <Stat label="Clicks" value={formatCount(stats.totalClicks)} />
      </section>

      {(stuckCheckouts.length > 0 || stuckEvents.length > 0) && (
        <section>
          <h2 className="mb-3 font-semibold">Payment reconciliation</h2>
          <p className="mb-3 text-xs text-muted">
            Checkouts that expired without a confirmed webhook, and events that received but never finished
            processing — click through to re-check directly against Dodo Payments.
          </p>
          {stuckCheckouts.length > 0 ? (
            <div className="mb-4 overflow-x-auto scrollbar-thin rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface text-left text-xs text-muted">
                    <th className="px-3 py-2">Listing</th>
                    <th className="px-3 py-2">Delta</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stuckCheckouts.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2">{c.targetDisplayName}</td>
                      <td className="px-3 py-2 font-mono">{formatUsd(c.deltaAmount)}</td>
                      <td className="px-3 py-2 text-xs text-muted">{formatRelativeTime(c.createdAt)}</td>
                      <td className="px-3 py-2 text-xs">{c.status}</td>
                      <td className="px-3 py-2">
                        <AdminReconcileButton checkoutId={c.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {stuckEvents.length > 0 ? (
            <p className="text-xs text-danger">
              {stuckEvents.length} webhook event(s) received but never finished processing — check server logs.
            </p>
          ) : null}
        </section>
      )}

      {flags.length > 0 ? (
        <section>
          <h2 className="mb-3 font-semibold">Moderation queue</h2>
          <ul className="space-y-2">
            {flags.map((flag) => (
              <li key={flag.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>
                  <a href={`/product/${flag.listing.slug}`} target="_blank" className="underline">
                    {flag.listing.displayName}
                  </a>{" "}
                  — {flag.reason} · {formatRelativeTime(flag.createdAt)}
                </span>
                <AdminResolveFlagButton flagId={flag.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Listings</h2>
          <form className="text-sm">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name…"
              className="rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
            />
          </form>
        </div>
        <div className="overflow-x-auto scrollbar-thin rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-left text-xs text-muted">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <AdminListingRow key={listing.id} listing={listing} categories={categories} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="font-mono text-lg font-bold tabular">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
