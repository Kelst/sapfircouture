"use client";

import { useTranslations } from "next-intl";
import { DressCard, DressCardSkeleton } from "./dress-card";
import { cn } from "@/lib/utils";
import type { Dress } from "@/types/api";

interface DressGridProps {
  dresses?: Dress[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  onQuickView?: (dress: Dress) => void;
}

export function DressGrid({
  dresses = [],
  isLoading,
  columns = 3,
  onQuickView,
}: DressGridProps) {
  const t = useTranslations("catalog");

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-6 md:gap-8", gridCols[columns])}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <DressCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (dresses.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-px bg-gold/30 mx-auto mb-6" />
        <p className="font-serif text-xl text-muted-foreground mb-2">
          {t("noResults")}
        </p>
        <p className="text-sm text-muted-foreground/70">
          {t("tryAdjustingFilters")}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 md:gap-8", gridCols[columns])}>
      {dresses.map((dress, index) => (
        <DressCard
          key={dress.id}
          dress={dress}
          index={index}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}
