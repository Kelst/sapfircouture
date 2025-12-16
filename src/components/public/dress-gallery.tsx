"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, ZoomIn, Play, ImageOff } from "lucide-react";
import { VideoPlayer } from "./video-player";

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxType, setLightboxType] = useState<"image" | "video">("image");
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [lightboxMousePos, setLightboxMousePos] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);
  const lightboxImageRef = useRef<HTMLDivElement>(null);

  const hasVideos = videos.length > 0;
  const hasImages = images.length > 0;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxZoomed) {
          setLightboxZoomed(false);
        } else {
          setIsLightboxOpen(false);
        }
      }
      if (lightboxType === "image" && !lightboxZoomed) {
        if (e.key === "ArrowLeft") handlePrevImage();
        if (e.key === "ArrowRight") handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, activeImageIndex, lightboxType, lightboxZoomed]);

  // Reset lightbox zoom when changing images
  useEffect(() => {
    setLightboxZoomed(false);
  }, [activeImageIndex]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !isZoomed) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lightboxImageRef.current || !lightboxZoomed) return;

    const rect = lightboxImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLightboxMousePos({ x, y });
  };

  const openImageLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxType("image");
    setIsLightboxOpen(true);
  };

  const openVideoLightbox = (index: number) => {
    setActiveVideoIndex(index);
    setLightboxType("video");
    setIsLightboxOpen(true);
  };

  if (!hasImages && !hasVideos) {
    return (
      <div className="aspect-[4/5] bg-pearl flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 w-full max-w-full">
        {/* Photo Gallery */}
        {hasImages && (
          <div className="space-y-3 w-full min-[530px]:max-w-[480px] min-[530px]:mx-auto xl:mx-0">
            {/* Main Image */}
            <div
              ref={mainImageRef}
              className="relative aspect-[4/5] max-h-[600px] w-full bg-pearl overflow-hidden cursor-zoom-in group"
              onClick={() => openImageLightbox(activeImageIndex)}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <GalleryImage
                src={images[activeImageIndex]}
                alt={`${dressName} - Image ${activeImageIndex + 1}`}
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

              {/* Zoom Icon */}
              <div className="absolute bottom-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-foreground" />
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "relative aspect-square overflow-hidden transition-all duration-300 shimmer-gold",
                      activeImageIndex === index
                        ? "ring-2 ring-gold"
                        : "ring-1 ring-transparent hover:ring-gold/50"
                    )}
                  >
                    <GalleryImage
                      src={image}
                      alt={`${dressName} - Thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
                {images.length > 4 && (
                  <button
                    onClick={() => openImageLightbox(4)}
                    className="relative aspect-square bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground/70">+{images.length - 4}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video Section */}
        {hasVideos && (
          <div className="space-y-3 pt-4 border-t border-muted/30">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-gold" />
              <h3 className="font-serif text-lg">
                Відео ({videos.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => openVideoLightbox(index)}
                  className="relative aspect-video bg-charcoal rounded-sm overflow-hidden group hover:ring-2 hover:ring-gold transition-all"
                >
                  {/* Video preview or placeholder */}
                  <video
                    src={video}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>

                  {/* Video number */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-white/[0.98] backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => { if (!lightboxZoomed) { setIsLightboxOpen(false); } }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxZoomed(false); setIsLightboxOpen(false); }}
            className="absolute top-6 right-6 z-20 p-2 text-foreground/40 hover:text-gold transition-colors duration-300 cursor-pointer"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {lightboxType === "image" ? (
            <>
              {/* Navigation for images (hidden when zoomed) */}
              {images.length > 1 && !lightboxZoomed && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-8 top-1/2 -translate-y-1/2 z-10 group p-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-foreground/20 rounded-full transition-all duration-300 group-hover:border-gold group-hover:bg-gold/5">
                      <ChevronLeft className="w-5 h-5 text-foreground/50 transition-colors duration-300 group-hover:text-gold" strokeWidth={1.5} />
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 z-10 group p-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-foreground/20 rounded-full transition-all duration-300 group-hover:border-gold group-hover:bg-gold/5">
                      <ChevronRight className="w-5 h-5 text-foreground/50 transition-colors duration-300 group-hover:text-gold" strokeWidth={1.5} />
                    </div>
                  </button>
                </>
              )}

              {/* Image Content */}
              <div
                ref={lightboxImageRef}
                className={cn(
                  "relative w-full max-w-5xl mx-4 aspect-[3/4] md:aspect-auto md:h-[70vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300",
                  lightboxZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                onClick={(e) => { e.stopPropagation(); setLightboxZoomed(!lightboxZoomed); }}
                onMouseMove={handleLightboxMouseMove}
              >
                <GalleryImage
                  src={images[activeImageIndex]}
                  alt={`${dressName} - Image ${activeImageIndex + 1}`}
                  fill
                  sizes="100vw"
                  className={cn(
                    "object-contain transition-all duration-300 ease-out",
                    lightboxZoomed && "scale-[2.5]"
                  )}
                  style={
                    lightboxZoomed
                      ? {
                          transformOrigin: `${lightboxMousePos.x}% ${lightboxMousePos.y}%`,
                        }
                      : undefined
                  }
                />

                {/* Zoom hint */}
                {!lightboxZoomed && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 bg-foreground/5 backdrop-blur-sm border border-foreground/10 text-foreground/60 text-xs uppercase tracking-wider pointer-events-none">
                    <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Збільшити
                  </div>
                )}
              </div>

              {/* Counter (hidden when zoomed) */}
              {!lightboxZoomed && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 font-serif text-base text-foreground/50 tracking-wider">
                  <span className="text-foreground">{activeImageIndex + 1}</span>
                  <span className="mx-2">/</span>
                  <span>{images.length}</span>
                </div>
              )}

              {/* Thumbnail Strip (hidden when zoomed) */}
              {images.length > 1 && !lightboxZoomed && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/80 backdrop-blur-sm border border-foreground/5 max-w-[90vw] overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(index); }}
                      className={cn(
                        "relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 overflow-hidden transition-all duration-300 cursor-pointer shimmer-gold",
                        activeImageIndex === index
                          ? "ring-2 ring-gold ring-offset-1"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <GalleryImage
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Video Navigation */}
              {videos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoIndex((prev) => (prev === 0 || prev === null ? videos.length - 1 : prev - 1));
                    }}
                    className="absolute left-8 top-1/2 -translate-y-1/2 z-10 group p-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-foreground/20 rounded-full transition-all duration-300 group-hover:border-gold group-hover:bg-gold/5">
                      <ChevronLeft className="w-5 h-5 text-foreground/50 transition-colors duration-300 group-hover:text-gold" strokeWidth={1.5} />
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoIndex((prev) => (prev === null || prev === videos.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 z-10 group p-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-foreground/20 rounded-full transition-all duration-300 group-hover:border-gold group-hover:bg-gold/5">
                      <ChevronRight className="w-5 h-5 text-foreground/50 transition-colors duration-300 group-hover:text-gold" strokeWidth={1.5} />
                    </div>
                  </button>
                </>
              )}

              {/* Video Content */}
              <div
                className="flex items-center justify-center w-full h-full px-4 animate-in zoom-in-95 fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <VideoPlayer
                  key={activeVideoIndex}
                  src={videos[activeVideoIndex ?? 0]}
                  className="max-w-4xl"
                  autoPlay
                />
              </div>

              {/* Video Counter */}
              {videos.length > 1 && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 font-serif text-base text-foreground/50 tracking-wider">
                  <span className="text-foreground">Відео {(activeVideoIndex ?? 0) + 1}</span>
                  <span className="mx-2">/</span>
                  <span>{videos.length}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
