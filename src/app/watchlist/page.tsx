import { Bell } from "lucide-react";
import { WatchlistClient } from "@/components/WatchlistClient";

export const metadata = {
  title: "Watchlist",
  description: "Track the listings you care about and see the moment they get overtaken.",
};

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight">
        <Bell className="h-5 w-5 text-primary" strokeWidth={2.5} />
        Watchlist
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Listings you&apos;re watching, and whether anyone has passed them since you last checked.
      </p>
      <WatchlistClient />
    </div>
  );
}
