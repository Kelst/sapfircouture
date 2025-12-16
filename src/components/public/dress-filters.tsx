"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Collection, Style } from "@/types/api";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DressFiltersProps {
  collections: Collection[];
  styles: Style[];
  currentCollection?: string;
  currentStyle?: string;
  totalCount?: number;
}

export function DressFilters({
  collections,
  styles,
  currentCollection,
  currentStyle,
  totalCount,
}: DressFiltersProps) {
  const t = useTranslations("catalog.filters");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasActiveFilters = currentCollection || currentStyle;

  const updateFilters = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset offset when filters change
      params.delete("offset");

      const queryString = params.toString();
      router.push(queryString ? `/catalog?${queryString}` : "/catalog");
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/catalog");
  }, [router]);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Collections Filter */}
      <div>
        <h3 className="font-serif text-lg mb-4">{t("collection")}</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilters("collection", null)}
            className={cn(
              "block w-full text-left py-2 text-sm transition-colors",
              !currentCollection
                ? "text-gold font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("all")}
          </button>
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => updateFilters("collection", collection.slug)}
              className={cn(
                "block w-full text-left py-2 text-sm transition-colors",
                currentCollection === collection.slug
                  ? "text-gold font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {collection.name}
              {collection.dressCount !== undefined && (
                <span className="ml-2 text-muted-foreground/50">
                  ({collection.dressCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Styles Filter */}
      <div>
        <h3 className="font-serif text-lg mb-4">{t("style")}</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilters("style", null)}
            className={cn(
              "block w-full text-left py-2 text-sm transition-colors",
              !currentStyle
                ? "text-gold font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("all")}
          </button>
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => updateFilters("style", style.name)}
              className={cn(
                "block w-full text-left py-2 text-sm transition-colors",
                currentStyle === style.name
                  ? "text-gold font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
        >
          <X className="w-4 h-4" />
          {t("clear")}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters - Sticky Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-28">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters - Sheet */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {tCatalog("showingResults", { count: totalCount ?? 0 })}
        </p>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2",
                hasActiveFilters && "border-gold text-gold"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("all")}
              {hasActiveFilters && (
                <span className="bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(currentCollection ? 1 : 0) + (currentStyle ? 1 : 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader className="mb-8">
              <SheetTitle className="font-serif text-xl">
                {t("all")}
              </SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Active filters display
export function ActiveFilters({
  collections,
  styles,
  currentCollection,
  currentStyle,
}: Pick<DressFiltersProps, "collections" | "styles" | "currentCollection" | "currentStyle">) {
  const t = useTranslations("catalog.filters");
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasActiveFilters = currentCollection || currentStyle;

  if (!hasActiveFilters) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const queryString = params.toString();
    router.push(queryString ? `/catalog?${queryString}` : "/catalog");
  };

  const collectionName = collections.find(c => c.slug === currentCollection)?.name;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {currentCollection && collectionName && (
        <button
          onClick={() => removeFilter("collection")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-xs font-medium uppercase tracking-wider rounded-sm hover:bg-gold/20 transition-colors"
        >
          {collectionName}
          <X className="w-3 h-3" />
        </button>
      )}
      {currentStyle && (
        <button
          onClick={() => removeFilter("style")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-xs font-medium uppercase tracking-wider rounded-sm hover:bg-gold/20 transition-colors"
        >
          {currentStyle}
          <X className="w-3 h-3" />
        </button>
      )}
      <button
        onClick={() => router.push("/catalog")}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
      >
        {t("clear")}
      </button>
    </div>
  );
}
