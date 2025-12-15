"use client";

import { useTranslations } from "next-intl";
import { DressCard } from "./dress-card";
import { Skeleton } from "@/components/ui/skeleton";

interface DressGridProps {
  dresses?: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string;
    category?: string;
    isPopular?: boolean;
  }>;
  isLoading?: boolean;
}

export function DressGrid({ dresses = [], isLoading }: DressGridProps) {
  const t = useTranslations("catalog");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (dresses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {dresses.map((dress) => (
        <DressCard key={dress.id} {...dress} />
      ))}
    </div>
  );
}
