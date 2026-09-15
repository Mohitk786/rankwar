"use client";

import { useRouter } from "next/navigation";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ClaimRankButton({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="group/claim relative cursor-pointer whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:shadow-xl"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const onHome = window.location.pathname === "/";
          router.push(`/?amount=${amount}`, { scroll: !onHome });
          if (onHome) {
            document.getElementById("claim")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      >
        Claim this rank for {formatUsd(amount)}
        <span
          aria-hidden
          className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-foreground transition-colors duration-150 group-hover/claim:border-t-primary"
        />
      </button>
    </div>
  );
}
