"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FeaturedCollection } from "@/types/api";
import { getFeaturedCollections } from "@/lib/api/client";

interface FeaturedCollectionsProps {
  collections?: FeaturedCollection[];
}

export function FeaturedCollections({ collections: initialCollections }: FeaturedCollectionsProps) {
  const t = useTranslations("home");
  const [collections, setCollections] = useState<FeaturedCollection[]>(initialCollections ?? []);
  const [isLoading, setIsLoading] = useState(!initialCollections);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch collections if not provided
  useEffect(() => {
    if (initialCollections) return;

    async function fetchCollections() {
      try {
        const data = await getFeaturedCollections();
        setCollections(data);
      } catch (error) {
        console.error("Failed to fetch featured collections:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollections();
  }, [initialCollections]);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-white">
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  // Determine layout based on number of collections
  const layoutType = collections.length >= 3 ? "asymmetric" : "equal";

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-white">
      <div className="container">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-12 md:mb-16",
            "transition-all duration-700 ease-out-expo",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="font-serif text-h2 font-light tracking-wide text-foreground mb-4">
            {t("featuredCollections")}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </div>

        {/* Collections Grid */}
        {layoutType === "asymmetric" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Large Card (First Collection) */}
            <CollectionCard
              collection={collections[0]}
              size="large"
              index={0}
              isVisible={isVisible}
            />

            {/* Stacked Cards (Second and Third Collections) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
              {collections.slice(1, 3).map((collection, index) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  size="small"
                  index={index + 1}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {collections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                size="medium"
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        <div
          className={cn(
            "text-center mt-12",
            "transition-all duration-700 ease-out-expo",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: isVisible ? "600ms" : "0ms" }}
        >
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-sans font-medium uppercase tracking-[0.2em] text-foreground hover:text-gold transition-colors"
          >
            {t("viewAllCollections")}
            <span className="text-gold">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

interface CollectionCardProps {
  collection: FeaturedCollection;
  size: "large" | "medium" | "small";
  index: number;
  isVisible: boolean;
}

function CollectionCard({ collection, size, index, isVisible }: CollectionCardProps) {
  const aspectRatio = {
    large: "aspect-[4/5] lg:aspect-[3/4]",
    medium: "aspect-[4/5]",
    small: "aspect-[4/5] lg:aspect-[16/9]",
  };

  return (
    <Link
      href={`/catalog?collection=${collection.slug}`}
      className={cn(
        "group relative block overflow-hidden",
        aspectRatio[size],
        "transition-all duration-700 ease-out-expo",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
      style={{ transitionDelay: isVisible ? `${200 + index * 150}ms` : "0ms" }}
    >
      {/* Image */}
      {collection.coverImage ? (
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          sizes={size === "large" ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-pearl" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8">
        <div className="text-center">
          <h3
            className={cn(
              "font-serif font-light tracking-wide text-white mb-2",
              size === "large" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            )}
          >
            {collection.name}
          </h3>
          {collection.description && size === "large" && (
            <p className="text-white/70 text-sm max-w-xs mx-auto mb-4 line-clamp-2">
              {collection.description}
            </p>
          )}
          <span className="inline-block text-xs font-sans font-medium uppercase tracking-[0.2em] text-gold opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            Explore
          </span>
        </div>
      </div>

      {/* Gold Border on Hover */}
      <div className="absolute inset-0 border-2 border-transparent transition-colors duration-500 group-hover:border-gold/30 pointer-events-none" />
    </Link>
  );
}
