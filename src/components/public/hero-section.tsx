"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/api";
import { getHeroSlides } from "@/lib/api/client";
import { getHeroSlideText, type Locale } from "@/types/api";
import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
  slides?: HeroSlide[];
}

export function HeroSection({ slides: initialSlides }: HeroSectionProps) {
  const t = useTranslations("hero");
  const locale = useLocale() as Locale;
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides ?? []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialSlides);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch slides if not provided
  useEffect(() => {
    if (initialSlides) return;

    async function fetchSlides() {
      try {
        const data = await getHeroSlides();
        setSlides(data);
      } catch (error) {
        console.error("Failed to fetch hero slides:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSlides();
  }, [initialSlides]);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const scrollToContent = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  }, []);

  // Fallback content when no slides
  if (!isLoading && slides.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-ivory to-pearl -mt-20">
        <div className="container text-center">
          <h1 className="font-serif text-hero font-light tracking-wide text-foreground mb-4 hero-fade-in">
            {t("title")}
          </h1>
          <p
            className="text-lg text-muted-foreground mb-8 hero-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            {t("subtitle")}
          </p>
          <div
            className="hero-fade-in"
            style={{ animationDelay: "800ms" }}
          >
            <Link href="/catalog" className="btn-gold">
              {t("cta")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative h-screen overflow-hidden -mt-20 transition-opacity duration-500",
        imageLoaded ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const title = getHeroSlideText(slide, "title", locale);
        const subtitle = getHeroSlideText(slide, "subtitle", locale);

        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Blurred background image for areas not covered */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover blur-md scale-125"
                unoptimized
                aria-hidden="true"
              />
            </div>

            {/* Main image with Ken Burns effect */}
            <div
              className={cn(
                "absolute inset-0",
                index === currentSlide && "animate-ken-burns"
              )}
            >
              <Image
                src={slide.image}
                alt={title || "Hero image"}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover md:object-contain"
                unoptimized
                onLoad={() => index === 0 && setImageLoaded(true)}
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container text-center text-white">
                {title && (
                  <h1
                    key={`title-${slide.id}-${currentSlide}`}
                    className={cn(
                      "font-serif text-hero font-light tracking-wide mb-4",
                      index === currentSlide ? "hero-fade-in" : "opacity-0"
                    )}
                    style={{ animationDelay: index === currentSlide ? "200ms" : "0ms" }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p
                    key={`subtitle-${slide.id}-${currentSlide}`}
                    className={cn(
                      "text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto",
                      index === currentSlide ? "hero-fade-in" : "opacity-0"
                    )}
                    style={{ animationDelay: index === currentSlide ? "400ms" : "0ms" }}
                  >
                    {subtitle}
                  </p>
                )}
                {slide.linkUrl && (
                  <div
                    key={`cta-${slide.id}-${currentSlide}`}
                    className={cn(
                      index === currentSlide ? "hero-fade-in" : "opacity-0"
                    )}
                    style={{ animationDelay: index === currentSlide ? "600ms" : "0ms" }}
                  >
                    <Link
                      href={slide.linkUrl}
                      className="btn-gold"
                    >
                      {t("cta")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-12 h-0.5 transition-all duration-500",
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-white transition-colors"
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-8 h-8 animate-scroll-bounce" />
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-ivory flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}
