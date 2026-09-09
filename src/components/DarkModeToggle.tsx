"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

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

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark ?? undefined}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-border bg-background transition-colors"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
        <Sun className="h-3.5 w-3.5 text-muted" strokeWidth={2.5} />
        <Moon className="h-3.5 w-3.5 text-muted" strokeWidth={2.5} />
      </span>
      <span
        className={`absolute left-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm transition-transform duration-200 ease-out ${
          isDark === null ? "translate-x-0 opacity-0" : isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Sun className="h-3.5 w-3.5" strokeWidth={2.5} />}
      </span>
    </button>
  );
}
