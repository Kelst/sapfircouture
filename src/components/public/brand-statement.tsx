"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { getContent } from "@/lib/api/client";
import type { Content, Locale } from "@/types/api";

interface BrandStatementProps {
  content?: Content;
}

export function BrandStatement({ content: initialContent }: BrandStatementProps) {
  const locale = useLocale() as Locale;
  const [content, setContent] = useState<Content | null>(initialContent ?? null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch content if not provided
  useEffect(() => {
    if (initialContent) return;

    async function fetchContent() {
      try {
        const data = await getContent();
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      }
    }

    fetchContent();
  }, [initialContent]);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const statement = content?.brandStatement?.[locale] || content?.brandStatement?.en || "";

  // Don't render if there's no content
  if (!statement) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-gradient-to-b from-white to-ivory"
    >
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative Element */}
          <div
            className={cn(
              "w-px h-12 bg-gold/50 mx-auto mb-8",
              "transition-all duration-700 ease-out-expo",
              isVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
            )}
          />

          {/* Statement Text */}
          <blockquote
            className={cn(
              "font-serif text-h3 font-light tracking-wide text-foreground leading-relaxed",
              "transition-all duration-700 ease-out-expo",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
          >
            <span className="text-gold text-4xl leading-none">&ldquo;</span>
            {statement}
            <span className="text-gold text-4xl leading-none">&rdquo;</span>
          </blockquote>

          {/* Decorative Element */}
          <div
            className={cn(
              "w-16 h-px bg-gold mx-auto mt-8",
              "transition-all duration-700 ease-out-expo",
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
            style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
          />
        </div>
      </div>
    </section>
  );
}
