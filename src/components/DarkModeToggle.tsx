"use client";

import { useEffect, useState } from "react";

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
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-foreground hover:border-foreground/40 transition-colors"
    >
      {isDark === null ? "…" : isDark ? "Light" : "Dark"}
    </button>
  );
}
