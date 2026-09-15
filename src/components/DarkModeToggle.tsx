"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // One-time read of client-only DOM state (set synchronously by ThemeScript
    // before hydration) to avoid an SSR/client markup mismatch — not a
    // subscription, so there's no external-store pattern to switch to here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("rw-theme", next ? "dark" : "light");
    } catch {}
    setIsDark(next);
  }

  const dark = Boolean(isDark);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark ?? undefined}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-muted p-0.5"
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-200 ease-out",
          dark ? "translate-x-5" : "translate-x-0",
        )}
      >
        {dark ? (
          <Moon className="size-3.5" strokeWidth={2.5} />
        ) : (
          <Sun className="size-3.5" strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}
