"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface CatalogLoadMoreProps {
  collection?: string;
  style?: string;
  currentOffset: number;
  limit: number;
  total: number;
}

export function CatalogLoadMore({
  collection,
  style,
  currentOffset,
  limit,
  total,
}: CatalogLoadMoreProps) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const searchParams = useSearchParams();

  const loadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", currentOffset.toString());
    params.set("limit", limit.toString());

    if (collection) params.set("collection", collection);
    if (style) params.set("style", style);

    router.push(`/catalog?${params.toString()}`, { scroll: false });
  }, [router, searchParams, currentOffset, limit, collection, style]);

  const remaining = total - currentOffset;

  return (
    <button
      onClick={loadMore}
      className={cn(
        "inline-flex items-center gap-2 px-8 py-3",
        "border border-foreground/20",
        "text-sm font-sans font-medium uppercase tracking-[0.15em]",
        "text-foreground",
        "transition-all duration-300",
        "hover:bg-foreground hover:text-white",
        "btn-outline-fill"
      )}
    >
      {t("loadMore")}
      <span className="text-muted-foreground">({remaining})</span>
    </button>
  );
}
