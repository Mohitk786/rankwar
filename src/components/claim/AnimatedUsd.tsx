"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const digitTransition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.7,
};

function RollingDigit({
  digit,
  reduceMotion,
  delay,
}: {
  digit: number;
  reduceMotion: boolean;
  delay: number;
}) {
  const hasLanded = useRef(false);
  useEffect(() => {
    hasLanded.current = true;
  }, []);

  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={reduceMotion ? false : { y: "-9em" }}
        animate={{ y: `${-digit}em` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { ...digitTransition, delay: hasLanded.current ? 0 : delay }
        }
      >
        {DIGITS.map((n) => (
          <span
            key={n}
            className="flex h-[1em] w-[1ch] items-center justify-center leading-none"
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function AnimatedUsd({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const formatted = formatUsd(value);
  const chars = formatted.split("");
  const digitCount = chars.filter((char) => char >= "0" && char <= "9").length;
  let digitIndex = 0;

  return (
    <span
      className={cn(
        "inline-flex items-center leading-none tabular-nums",
        className,
      )}
      aria-label={formatted}
    >
      {chars.map((char, index) => {
        if (char >= "0" && char <= "9") {
          const delay = (digitCount - 1 - digitIndex) * 0.06;
          digitIndex += 1;
          return (
            <RollingDigit
              key={`d-${chars.length - index}`}
              digit={Number(char)}
              reduceMotion={reduceMotion}
              delay={delay}
            />
          );
        }

        return (
          <motion.span
            key={`s-${chars.length - index}-${char}`}
            layout={!reduceMotion}
            className="inline-block leading-none"
            transition={digitTransition}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
