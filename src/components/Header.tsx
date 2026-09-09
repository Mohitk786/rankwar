import Link from "next/link";
import { Bell, CalendarDays, Info, LayoutGrid, ScrollText, TrendingUp } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";
import { getLiveActivityPulse } from "@/lib/ranking";
import { formatCount } from "@/lib/format";

const NAV_LINKS = [
  { href: "/today", label: "Today", icon: TrendingUp },
  { href: "/daily", label: "Daily", icon: CalendarDays },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/watchlist", label: "Watchlist", icon: Bell },
  { href: "/about", label: "About", icon: Info },
  { href: "/rules", label: "Rules", icon: ScrollText },
];

export async function Header() {
  const pulse = await getLiveActivityPulse();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-mono text-lg font-bold tracking-tight">
            Who&apos;s <span className="text-accent">#1</span>
          </Link>
          {pulse.clicksLast24h > 0 ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {formatCount(pulse.clicksLast24h)} clicks · {formatCount(pulse.paymentsLast24h)} raises today
            </span>
          ) : null}
        </div>
        <nav className="hidden items-center gap-5 text-sm text-muted sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              <link.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
        </div>
      </div>
      <nav className="flex items-center gap-4 overflow-x-auto scrollbar-thin border-t border-border px-4 py-2 text-sm text-muted sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-foreground">
            <link.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
