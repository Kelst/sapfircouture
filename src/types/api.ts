// ═══════════════════════════════════════════════════════════════
// API Types for Sapfir Couture Client
// ═══════════════════════════════════════════════════════════════

// Collection
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  dressCount?: number;
  dresses?: Dress[];
}

export interface FeaturedCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
}

// Dress
export interface Dress {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  videos: string[];
  order: number;
  createdAt: string;
  updatedAt?: string;
  collection: {
    id: string;
    name: string;
    slug: string;
  } | null;
  style: {
    id: string;
    nameEn: string;
    nameUk: string | null;
  } | null;
}

// Style
export interface Style {
  id: string;
  nameEn: string;
  nameUk: string | null;
  createdAt: string;
}

// Hero Slide
export interface HeroSlide {
  id: string;
  image: string;
  titleEn: string | null;
  titleUk: string | null;
  subtitleEn: string | null;
  subtitleUk: string | null;
  linkUrl: string | null;
  order: number;
}

// Social Link
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order: number;
  name: string;
  icon: string;
}

// Settings
export interface Settings {
  company_name?: string;
  contact_phones?: string[];
  contact_email?: string;
  address?: string;
  working_hours?: string;
  google_maps_url?: string;
}

// Content
export interface Content {
  brandStatement: {
    en: string;
    uk: string;
  };
  aboutContent: {
    en: string;
    uk: string;
  };
  ctaBanner: {
    image: string;
    text: {
      en: string;
      uk: string;
    };
  };
}

// Contact Request
export interface ContactRequest {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  dressId?: string;
  locale?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
  error?: {
    message: string;
    code: string;
    details?: unknown[];
  };
}

// Filter params for dresses
export interface DressFilters {
  collection?: string;
  style?: string;
  limit?: number;
  offset?: number;
}

// Locale type
export type Locale = "en" | "uk";

// Helper to get localized content
export function getLocalizedContent<T extends { en: string; uk: string }>(
  content: T,
  locale: Locale
): string {
  return content[locale] || content.en;
}

// Helper to get localized field from hero slide
export function getHeroSlideText(
  slide: HeroSlide,
  field: "title" | "subtitle",
  locale: Locale
): string | null {
  if (field === "title") {
    return locale === "uk" ? slide.titleUk : slide.titleEn;
  }
  return locale === "uk" ? slide.subtitleUk : slide.subtitleEn;
}

// Helper to get localized style name (fallback to English if Ukrainian not available)
export function getStyleName(
  style: Style | { nameEn: string; nameUk: string | null },
  locale: Locale
): string {
  if (locale === "uk" && style.nameUk) {
    return style.nameUk;
  }
  return style.nameEn;
}
