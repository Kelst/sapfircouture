"use client";

import { useLocale } from "next-intl";
import type { Content, Locale } from "@/types/api";

interface BrandStatementProps {
  content?: Content;
}

export function BrandStatement({ content }: BrandStatementProps) {
  const locale = useLocale() as Locale;
  const statement = content?.brandStatement?.[locale] || content?.brandStatement?.en || "";

  // Don't render if there's no content
  if (!statement) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-white to-ivory">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative Element */}
          <div className="w-px h-8 bg-gold/50 mx-auto mb-5" />

          {/* Statement Text */}
          <blockquote className="font-serif text-2xl md:text-3xl font-light tracking-wide text-foreground leading-relaxed">
            <span className="text-gold text-4xl leading-none">&ldquo;</span>
            {statement}
            <span className="text-gold text-4xl leading-none">&rdquo;</span>
          </blockquote>

          {/* Decorative Element */}
          <div className="w-12 h-px bg-gold mx-auto mt-5" />
        </div>
      </div>
    </section>
  );
}
