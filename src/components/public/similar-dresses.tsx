"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DressCard } from "./dress-card";
import { cn } from "@/lib/utils";
import type { Dress } from "@/types/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimilarDressesProps {
  dresses: Dress[];
}

export function SimilarDresses({ dresses }: SimilarDressesProps) {
  const t = useTranslations("dress");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [dresses]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (dresses.length === 0) return null;

  return (
    <section className="py-16 bg-ivory">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-h3 font-light tracking-wide text-foreground">
            {t("similarDresses")}
          </h2>

          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "p-2 border rounded-full transition-all",
                canScrollLeft
                  ? "border-foreground/20 hover:bg-foreground hover:text-white"
                  : "border-muted text-muted cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "p-2 border rounded-full transition-all",
                canScrollRight
                  ? "border-foreground/20 hover:bg-foreground hover:text-white"
                  : "border-muted text-muted cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="relative -mx-4 px-4">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {dresses.map((dress, index) => (
              <div
                key={dress.id}
                className="flex-shrink-0 w-[280px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <DressCard dress={dress} index={index} />
              </div>
            ))}
          </div>

          {/* Gradient Overlays */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-ivory to-transparent pointer-events-none hidden md:block" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-ivory to-transparent pointer-events-none hidden md:block" />
          )}
        </div>
      </div>
    </section>
  );
}
