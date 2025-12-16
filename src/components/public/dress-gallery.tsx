"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, ZoomIn, Play, ImageOff } from "lucide-react";

interface DressGalleryProps {
  images: string[];
  videos?: string[];
  dressName: string;
}

// Image component with error fallback
function GalleryImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
  style,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-pearl flex items-center justify-center">
        <ImageOff className="w-12 h-12 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      onError={() => setError(true)}
      unoptimized
    />
  );
}

export function DressGallery({ images, videos = [], dressName }: DressGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  const allMedia = [...images, ...videos];
  const isVideo = (index: number) => index >= images.length;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !isZoomed) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (allMedia.length === 0) {
    return (
      <div className="aspect-[3/4] bg-pearl flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          ref={mainImageRef}
          className="relative aspect-[4/5] max-h-[600px] bg-pearl overflow-hidden cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {!isVideo(activeIndex) ? (
            <GalleryImage
              src={allMedia[activeIndex]}
              alt={`${dressName} - Image ${activeIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                "object-cover transition-transform duration-300",
                isZoomed && "scale-150"
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : undefined
              }
            />
          ) : (
            <video
              src={allMedia[activeIndex]}
              className="w-full h-full object-cover"
              controls
            />
          )}

          {/* Zoom Icon */}
          <div className="absolute bottom-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5 text-foreground" />
          </div>
        </div>

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {allMedia.slice(0, 5).map((media, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative aspect-square overflow-hidden transition-all duration-300",
                  activeIndex === index
                    ? "ring-2 ring-gold"
                    : "ring-1 ring-transparent hover:ring-gold/50"
                )}
              >
                {!isVideo(index) ? (
                  <GalleryImage
                    src={media}
                    alt={`${dressName} - Thumbnail ${index + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-charcoal flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            ))}
            {allMedia.length > 5 && (
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-square bg-foreground/10 flex items-center justify-center"
              >
                <span className="text-sm font-medium">+{allMedia.length - 5}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          {/* Main Content */}
          <div className="relative w-full max-w-5xl mx-4 aspect-[3/4] md:aspect-auto md:h-[80vh]">
            {!isVideo(activeIndex) ? (
              <GalleryImage
                src={allMedia[activeIndex]}
                alt={`${dressName} - Image ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            ) : (
              <video
                src={allMedia[activeIndex]}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {activeIndex + 1} / {allMedia.length}
          </div>

          {/* Thumbnail Strip */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
              {allMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeIndex === index ? "bg-white w-8" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
