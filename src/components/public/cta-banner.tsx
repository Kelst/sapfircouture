"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Content, Locale } from "@/types/api";

interface CtaBannerProps {
  content?: Content;
}

export function CtaBanner({ content }: CtaBannerProps) {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;

  const ctaText = content?.ctaBanner?.text?.[locale] || content?.ctaBanner?.text?.en || "";
  const ctaImage = content?.ctaBanner?.image || "";

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      {ctaImage ? (
        <>
          <Image
            src={ctaImage}
            alt="Contact us"
            fill
            sizes="100vw"
            className="object-cover"
            loading="lazy"
            unoptimized
          />
          <div className="absolute inset-0 bg-white/60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-pearl" />
      )}

      {/* Content */}
      <div className="relative container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-h2 font-light tracking-wide text-charcoal mb-6">
            {ctaText || t("ctaTitle")}
          </h2>

          <p className="text-gray text-lg mb-8 max-w-lg mx-auto">
            {t("ctaSubtitle")}
          </p>

          <Link href="/contacts" className="btn-gold">
            {t("ctaButton")}
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 left-8 w-24 h-24 border border-gold/40 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border border-gold/40 pointer-events-none hidden md:block" />
    </section>
  );
}
