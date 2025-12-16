import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DressGallery } from "@/components/public/dress-gallery";
import { SimilarDresses } from "@/components/public/similar-dresses";
import { BookFittingForm } from "./book-fitting-form";
import { ShareButton } from "./share-button";
import { getDressServer, getDressesServer } from "@/lib/api/client";
import { getStyleName, type Locale } from "@/types/api";
import { ChevronLeft } from "lucide-react";
import { trackDressView } from "@/actions/views.actions";
import type { Metadata } from "next";

interface DressPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: DressPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dress = await getDressServer(slug);

  if (!dress) {
    return {
      title: "Dress not found",
    };
  }

  return {
    title: `${dress.name} - Sapfir Couture`,
    description: dress.description || `Discover ${dress.name} from our exclusive wedding dress collection`,
    openGraph: {
      images: dress.images[0] ? [dress.images[0]] : [],
    },
  };
}

export default async function DressPage({ params }: DressPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("dress");

  const dress = await getDressServer(slug);

  if (!dress) {
    notFound();
  }

  // Track view (fire-and-forget, doesn't block rendering)
  void trackDressView(dress.id);

  // Fetch similar dresses (same collection or style)
  const { dresses: similarDresses } = await getDressesServer({
    collection: dress.collection?.slug,
    limit: 6,
  });

  // Filter out current dress from similar dresses
  const filteredSimilar = similarDresses.filter((d) => d.id !== dress.id);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-ivory py-4">
        <div className="container">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("backToCatalog")}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="container">
          <div className="grid xl:grid-cols-2 gap-8 xl:gap-16">
            {/* Gallery */}
            <div className="min-w-0 overflow-hidden">
              <DressGallery
                images={dress.images}
                videos={dress.videos}
                dressName={dress.name}
              />
            </div>

            {/* Details */}
            <div className="xl:sticky xl:top-28 xl:self-start">
              <div className="space-y-6">
                {/* Collection Badge */}
                {dress.collection && (
                  <Link
                    href={`/catalog?collection=${dress.collection.slug}`}
                    className="inline-block text-xs font-sans font-medium uppercase tracking-[0.2em] text-gold hover:underline"
                  >
                    {dress.collection.name}
                  </Link>
                )}

                {/* Dress Name */}
                <h1 className="font-serif text-h2 font-light tracking-wide text-foreground">
                  {dress.name}
                </h1>

                {/* Style Badge */}
                {dress.style && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t("style")}:
                    </span>
                    <span className="text-sm font-medium">
                      {getStyleName(dress.style, locale as Locale)}
                    </span>
                  </div>
                )}

                {/* Description */}
                {dress.description && (
                  <div className="py-6 border-t border-b border-muted/30">
                    <p className="text-muted-foreground leading-relaxed">
                      {dress.description}
                    </p>
                  </div>
                )}

                {/* CTA Section */}
                <div className="space-y-4 pt-4">
                  <BookFittingForm dressId={dress.id} dressName={dress.name} />

                  {/* Share */}
                  <ShareButton title={dress.name} />
                </div>

                {/* Additional Info */}
                <div className="pt-8 space-y-4 text-sm text-muted-foreground">
                  <p>
                    * {dress.name} is available exclusively at Sapfir Couture.
                    Book your private fitting today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Dresses */}
      {filteredSimilar.length > 0 && (
        <SimilarDresses dresses={filteredSimilar} />
      )}
    </main>
  );
}
