import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { DressGrid } from "@/components/public/dress-grid";
import { DressFilters, ActiveFilters } from "@/components/public/dress-filters";
import {
  getDressesServer,
  getCollectionsServer,
  getStylesServer,
} from "@/lib/api/client";
import { CatalogLoadMore } from "./load-more";

interface CatalogPageProps {
  searchParams: Promise<{
    collection?: string;
    style?: string;
    offset?: string;
    limit?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const t = await getTranslations("catalog");

  const collection = params.collection;
  const style = params.style;
  const limit = params.limit ? parseInt(params.limit) : 12;
  const offset = params.offset ? parseInt(params.offset) : 0;

  // Fetch data in parallel
  const [dressesData, collections, styles] = await Promise.all([
    getDressesServer({ collection, style, limit, offset }),
    getCollectionsServer(),
    getStylesServer(),
  ]);

  const { dresses, total } = dressesData;
  const hasMore = offset + dresses.length < total;

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-ivory py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-serif text-h1 font-light tracking-wide text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
      </section>

      {/* Catalog Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Filters Sidebar (Desktop) */}
            <Suspense fallback={<FiltersSkeleton />}>
              <DressFilters
                collections={collections}
                styles={styles}
                currentCollection={collection}
                currentStyle={style}
                totalCount={total}
              />
            </Suspense>

            {/* Main Content */}
            <div className="flex-1">
              {/* Active Filters */}
              <Suspense fallback={null}>
                <ActiveFilters
                  collections={collections}
                  styles={styles}
                  currentCollection={collection}
                  currentStyle={style}
                />
              </Suspense>

              {/* Results Count (Desktop) */}
              <div className="hidden lg:flex items-center justify-between mb-8">
                <p className="text-sm text-muted-foreground">
                  {t("showingResults", { count: total })}
                </p>
              </div>

              {/* Dress Grid */}
              <Suspense fallback={<DressGrid isLoading columns={4} />}>
                <DressGrid dresses={dresses} columns={4} />
              </Suspense>

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <CatalogLoadMore
                    collection={collection}
                    style={style}
                    currentOffset={offset + dresses.length}
                    limit={limit}
                    total={total}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FiltersSkeleton() {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-6 w-24 bg-muted rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-full bg-muted/50 rounded" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-16 bg-muted rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full bg-muted/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
