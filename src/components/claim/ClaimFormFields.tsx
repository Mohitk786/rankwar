"use client";

import { AtSign, Globe } from "lucide-react";
import { getCategoryVisual } from "@/lib/category-visuals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ClaimCategory } from "./types";

export function ClaimFormFields({
  variant,
  input,
  onInputChange,
  lockCategory,
  showCategorySelect,
  categories,
  categorySlug,
  categoryName,
  onCategoryChange,
  onSubmit,
}: {
  variant: "hero" | "default";
  input: string;
  onInputChange: (value: string) => void;
  lockCategory: boolean;
  showCategorySelect: boolean;
  categories: ClaimCategory[];
  categorySlug: string;
  categoryName: string;
  onCategoryChange: (slug: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isHandle = input.trim().startsWith("@");

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex w-full flex-col",
        variant === "hero" && "sm:flex-row sm:items-stretch",
      )}
    >
      <div className="relative min-w-0 flex-1">
        <span className="pointer-events-none absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {isHandle ? <AtSign className="size-4" /> : <Globe className="size-4" />}
        </span>
        <Input
          id="claim-input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={variant === "hero" ? "Website or @handle" : "Your product URL or @handle"}
          className="h-12 min-h-12 rounded-full border-border bg-card pl-12 text-base shadow-none md:text-base focus-visible:border-primary focus-visible:ring-0"
        />
      </div>
      {lockCategory ? null : (
        <div
          aria-hidden={!showCategorySelect}
          className={cn(
            "min-w-0 overflow-hidden transition-all duration-300 ease-out",
            showCategorySelect
              ? "mt-3 max-h-12 opacity-100 sm:mt-0 sm:ml-3 sm:w-55 sm:max-w-55"
              : "pointer-events-none mt-0 max-h-0 opacity-0 sm:ml-0 sm:w-0 sm:max-w-0 sm:max-h-none",
          )}
        >
          <Select value={categorySlug || undefined} onValueChange={onCategoryChange}>
            <SelectTrigger
              id="claim-category"
              title={categoryName || undefined}
              className="h-12 min-h-12 w-full min-w-0 overflow-hidden rounded-full border-border bg-card px-4 text-base shadow-none focus-visible:border-primary focus-visible:ring-0 data-[state=open]:border-primary data-[state=open]:ring-0 data-[size=default]:h-12 data-[size=default]:min-h-12"
            >
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              avoidCollisions={false}
              className="h-72 max-h-72"
            >
              {categories.map((category) => {
                const { icon: Icon } = getCategoryVisual(category.slug);
                return (
                  <SelectItem key={category.slug} value={category.slug}>
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span className="truncate">{category.name}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="mt-3 h-12 min-h-12 shrink-0 rounded-full px-8 text-base sm:mt-0 sm:ml-3">
        Claim rank
      </Button>
    </form>
  );
}
