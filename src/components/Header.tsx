import Link from "next/link";
import { DarkModeToggle } from "./DarkModeToggle";
import { LiveDot } from "./LiveDot";
import { HeaderNav } from "./HeaderNav";
import { getVisitorStats } from "@/lib/datafast";
import { formatCount } from "@/lib/format";

export async function Header() {
  const stats = await getVisitorStats();

  return (
    <header className="sticky top-0 z-30 flex justify-center px-4 pt-6">
      <div className="flex max-w-full items-center gap-1.5 rounded-lg bg-background/50 p-1.5 ring-1 ring-foreground/10 backdrop-blur-md">
        <Link
          href="/"
          className="shrink-0 rounded-full px-4 py-2 font-serif text-lg font-semibold tracking-tight"
        >
          Who&apos;s <span className="text-primary">#1</span>
        </Link>
        <span
          aria-hidden
          className="hidden h-5 w-px bg-foreground/10 sm:block"
        />
        <HeaderNav />
        {stats ? (
          <>
            <span
              aria-hidden
              className="hidden h-5 w-px bg-foreground/10 md:block"
            />
            <span className="hidden items-center gap-1.5 px-3 text-xs text-muted-foreground md:flex">
              <LiveDot />
              {formatCount(stats.onlineNow)}
            </span>
          </>
        ) : null}
        <span aria-hidden className="h-5 w-px bg-foreground/10" />
        <div className="pr-0.5">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
