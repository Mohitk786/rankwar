"use client";

import { useEffect, useRef, useState } from "react";
import { formatCount, formatUsd } from "@/lib/format";

const FORMATTERS = { usd: formatUsd, count: formatCount } as const;

/** Animates a number counting up from 0 to `value` on mount — the value itself is always real data from the server, this only animates its reveal. `variant` picks the formatter client-side since functions can't cross the server/client boundary as props. */
export function CountUp({ value, variant, durationMs = 900 }: { value: number; variant: keyof typeof FORMATTERS; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);
  const format = FORMATTERS[variant];

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // One-time client-only preference check, not a subscription — skip the animation entirely.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{format(display)}</>;
}
