"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getContent } from "@/lib/api/client";
import type { Content, Locale } from "@/types/api";

interface CtaBannerProps {
  content?: Content;
}

export function CtaBanner({ content: initialContent }: CtaBannerProps) {
  const t = useTranslations("home");
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const ctaText = content?.ctaBanner?.text?.[locale] || content?.ctaBanner?.text?.en || "";
  const ctaImage = content?.ctaBanner?.image || "";

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      {ctaImage ? (
        <>
          <Image
            src={ctaImage}
            alt="Contact us"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-pearl" />
      )}

      {/* Content */}
      <div className="relative container">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className={cn(
              "font-serif text-h2 font-light tracking-wide text-charcoal mb-6",
              "transition-all duration-700 ease-out-expo",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {ctaText || t("ctaTitle")}
          </h2>

          <p
            className={cn(
              "text-gray text-lg mb-8 max-w-lg mx-auto",
              "transition-all duration-700 ease-out-expo",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
          >
            {t("ctaSubtitle")}
          </p>

          <div
            className={cn(
              "transition-all duration-700 ease-out-expo",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
          >
            <Link href="/contacts" className="btn-gold">
              {t("ctaButton")}
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 left-8 w-24 h-24 border border-gold/40 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border border-gold/40 pointer-events-none hidden md:block" />
    </section>
  );
}
