"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Dress } from "@/types/api";
import { Eye, ImageOff } from "lucide-react";

interface DressCardProps {
  dress: Dress;
  index?: number;
  onQuickView?: (dress: Dress) => void;
}

export function DressCard({ dress, index = 0, onQuickView }: DressCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = dress.images[0];
  const secondaryImage = dress.images[1];
  const hasSecondaryImage = !!secondaryImage;

  return (
    <article
      className={cn(
        "group relative",
        "animate-fade-up"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "backwards",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/catalog/${dress.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-pearl">
          {/* Gold Border Reveal */}
          <div
            className={cn(
              "absolute inset-0 z-10 pointer-events-none",
              "border-2 border-transparent transition-all duration-500 ease-out-expo",
              "group-hover:border-gold/30"
            )}
          />

          {/* Primary Image */}
          {primaryImage && !imageError ? (
            <>
              <Image
                src={primaryImage}
                alt={dress.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-700 ease-out-expo",
                  hasSecondaryImage && isHovered && "opacity-0",
                  "group-hover:scale-105",
                  !imageLoaded && "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                unoptimized
              />

              {/* Secondary Image (shown on hover) */}
              {hasSecondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${dress.name} - alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={cn(
                    "object-cover transition-all duration-700 ease-out-expo",
                    "absolute inset-0",
                    isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  )}
                  unoptimized
                />
              )}

              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageOff className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent",
              "opacity-0 transition-opacity duration-500",
              "group-hover:opacity-100"
            )}
          />

          {/* Collection Badge */}
          {dress.collection && (
            <div
              className={cn(
                "absolute top-4 left-4 z-20",
                "px-3 py-1.5",
                "bg-white/95 backdrop-blur-sm",
                "text-[10px] font-sans font-semibold uppercase tracking-[0.15em]",
                "text-gold",
                "transition-all duration-300",
                "group-hover:text-foreground"
              )}
            >
              {dress.collection.name}
            </div>
          )}

          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(dress);
              }}
              className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 z-20",
                "flex items-center gap-2 px-6 py-2.5",
                "bg-white/95 backdrop-blur-sm",
                "text-xs font-sans font-medium uppercase tracking-[0.15em]",
                "text-foreground",
                "transition-all duration-500 ease-out-expo",
                "opacity-0 translate-y-4",
                "group-hover:opacity-100 group-hover:translate-y-0",
                "hover:bg-gold hover:text-white"
              )}
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          )}
        </div>

        {/* Card Content */}
        <div className="pt-4 pb-2">
          {/* Style */}
          {dress.style && (
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-gold mb-1">
              {dress.style.name}
            </p>
          )}

          {/* Dress Name */}
          <h3
            className={cn(
              "font-serif text-lg font-light tracking-wide text-foreground",
              "transition-colors duration-300",
              "group-hover:text-gold"
            )}
          >
            {dress.name}
          </h3>
        </div>
      </Link>
    </article>
  );
}

// Skeleton component for loading state
export function DressCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-pearl skeleton" />
      <div className="pt-4 pb-2">
        <div className="h-3 w-16 bg-gold/10 rounded mb-2" />
        <div className="h-5 w-32 bg-muted/50 rounded" />
      </div>
    </div>
  );
}
