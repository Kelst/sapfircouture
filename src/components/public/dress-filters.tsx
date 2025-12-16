"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Collection, Style, Locale } from "@/types/api";
import { getStyleName } from "@/types/api";
import { X, SlidersHorizontal, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
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
  const locale = useLocale() as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = currentCollection || currentStyle;
  const activeFiltersCount = (currentCollection ? 1 : 0) + (currentStyle ? 1 : 0);

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

  // Desktop Filter Content
  const DesktopFilterContent = () => (
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
              onClick={() => updateFilters("style", style.nameEn)}
              className={cn(
                "block w-full text-left py-2 text-sm transition-colors",
                currentStyle === style.nameEn
                  ? "text-gold font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getStyleName(style, locale)}
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
          <DesktopFilterContent />
        </div>
      </aside>

      {/* Mobile Filters - Sheet */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {tCatalog("showingResults", { count: totalCount ?? 0 })}
        </p>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2 border-foreground/20",
                hasActiveFilters && "border-gold text-gold"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фільтри
              {hasActiveFilters && (
                <span className="bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0">
            {/* Header */}
            <SheetHeader className="px-6 pb-4 border-b border-muted/30 pt-2">
              <div className="flex items-center justify-between pr-8">
                <SheetTitle className="font-serif text-2xl font-light">
                  Фільтри
                </SheetTitle>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gold hover:underline"
                  >
                    {t("clear")}
                  </button>
                )}
              </div>
              {/* Active count */}
              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground mt-1">
                  Обрано: {activeFiltersCount}
                </p>
              )}
            </SheetHeader>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Collections */}
              <div className="mb-8">
                <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gold rounded-full" />
                  {t("collection")}
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilters("collection", null)}
                    className={cn(
                      "flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all",
                      !currentCollection
                        ? "bg-gold/10 text-gold"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="text-sm">{t("all")}</span>
                    {!currentCollection && <Check className="w-4 h-4" />}
                  </button>
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => updateFilters("collection", collection.slug)}
                      className={cn(
                        "flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all",
                        currentCollection === collection.slug
                          ? "bg-gold/10 text-gold"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <span className="text-sm">
                        {collection.name}
                        {collection.dressCount !== undefined && (
                          <span className="ml-2 text-muted-foreground/60">
                            ({collection.dressCount})
                          </span>
                        )}
                      </span>
                      {currentCollection === collection.slug && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div className="mb-8">
                <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gold rounded-full" />
                  {t("style")}
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilters("style", null)}
                    className={cn(
                      "flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all",
                      !currentStyle
                        ? "bg-gold/10 text-gold"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="text-sm">{t("all")}</span>
                    {!currentStyle && <Check className="w-4 h-4" />}
                  </button>
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateFilters("style", style.nameEn)}
                      className={cn(
                        "flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all",
                        currentStyle === style.nameEn
                          ? "bg-gold/10 text-gold"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <span className="text-sm">{getStyleName(style, locale)}</span>
                      {currentStyle === style.nameEn && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Apply Button */}
            <div className="px-6 py-4 border-t border-muted/30 bg-white">
              <SheetClose asChild>
                <button className="btn-gold w-full">
                  Показати результати ({totalCount ?? 0})
                </button>
              </SheetClose>
            </div>
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
  const locale = useLocale() as Locale;
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
  const activeStyle = styles.find(s => s.nameEn === currentStyle);

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
      {currentStyle && activeStyle && (
        <button
          onClick={() => removeFilter("style")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-xs font-medium uppercase tracking-wider rounded-sm hover:bg-gold/20 transition-colors"
        >
          {getStyleName(activeStyle, locale)}
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
