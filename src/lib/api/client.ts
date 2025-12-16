// ═══════════════════════════════════════════════════════════════
// API Client for Sapfir Couture
// ═══════════════════════════════════════════════════════════════

import type {
  ApiResponse,
  Collection,
  FeaturedCollection,
  Dress,
  DressFilters,
  Style,
  HeroSlide,
  SocialLink,
  Settings,
  Content,
  ContactRequest,
} from "@/types/api";

const API_BASE = "/api/v1";

// Generic fetch helper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Network error",
        code: "NETWORK_ERROR",
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// Collections
// ═══════════════════════════════════════════════════════════════

export async function getCollections(): Promise<Collection[]> {
  const response = await fetchApi<Collection[]>("/collections");
  return response.data ?? [];
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const response = await fetchApi<Collection>(`/collections/${slug}`);
  return response.success ? response.data ?? null : null;
}

export async function getFeaturedCollections(): Promise<FeaturedCollection[]> {
  const response = await fetchApi<FeaturedCollection[]>("/collections/featured");
  return response.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// Dresses
// ═══════════════════════════════════════════════════════════════

export interface DressesResponse {
  dresses: Dress[];
  total: number;
  limit: number;
  offset: number;
}

export async function getDresses(filters?: DressFilters): Promise<DressesResponse> {
  const params = new URLSearchParams();

  if (filters?.collection) params.set("collection", filters.collection);
  if (filters?.style) params.set("style", filters.style);
  if (filters?.limit) params.set("limit", filters.limit.toString());
  if (filters?.offset) params.set("offset", filters.offset.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/dresses?${queryString}` : "/dresses";

  const response = await fetchApi<Dress[]>(endpoint);

  return {
    dresses: response.data ?? [],
    total: response.meta?.total ?? 0,
    limit: response.meta?.limit ?? 20,
    offset: response.meta?.offset ?? 0,
  };
}

export async function getDress(slug: string): Promise<Dress | null> {
  const response = await fetchApi<Dress>(`/dresses/${slug}`);
  return response.success ? response.data ?? null : null;
}

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

export async function getStyles(): Promise<Style[]> {
  const response = await fetchApi<Style[]>("/styles");
  return response.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// Hero Slides
// ═══════════════════════════════════════════════════════════════

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const response = await fetchApi<HeroSlide[]>("/hero-slides");
  return response.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// Social Links
// ═══════════════════════════════════════════════════════════════

export async function getSocialLinks(): Promise<SocialLink[]> {
  const response = await fetchApi<SocialLink[]>("/social-links");
  return response.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════════════════════════

export async function getSettings(): Promise<Settings> {
  const response = await fetchApi<Settings>("/settings");
  return response.data ?? {};
}

// ═══════════════════════════════════════════════════════════════
// Content
// ═══════════════════════════════════════════════════════════════

export async function getContent(): Promise<Content> {
  const response = await fetchApi<Content>("/content");
  return (
    response.data ?? {
      brandStatement: { en: "", uk: "" },
      aboutContent: { en: "", uk: "" },
      ctaBanner: { image: "", text: { en: "", uk: "" } },
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// Contact Form
// ═══════════════════════════════════════════════════════════════

export interface ContactResponse {
  success: boolean;
  id?: string;
  error?: {
    message: string;
    code?: string;
  };
}

export async function submitContact(
  data: ContactRequest
): Promise<ContactResponse> {
  const response = await fetchApi<{ id: string; message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    return { success: true, id: response.data.id };
  }

  return {
    success: false,
    error: {
      message: response.error?.message ?? "Failed to submit contact form",
      code: response.error?.code,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Server-side fetchers (for use in Server Components)
// These use absolute URLs for server-side rendering
// ═══════════════════════════════════════════════════════════════

export function getServerApiUrl(): string {
  // In development, use localhost
  // In production, use the actual domain
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

async function fetchServerApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const baseUrl = getServerApiUrl();
    const res = await fetch(`${baseUrl}/api/v1${endpoint}`, {
      cache: "no-store", // Always fetch fresh data
    });
    return res.json();
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Server fetch error",
        code: "SERVER_ERROR",
      },
    };
  }
}

// Server-side versions
export async function getCollectionsServer(): Promise<Collection[]> {
  const response = await fetchServerApi<Collection[]>("/collections");
  return response.data ?? [];
}

export async function getCollectionServer(slug: string): Promise<Collection | null> {
  const response = await fetchServerApi<Collection>(`/collections/${slug}`);
  return response.success ? response.data ?? null : null;
}

export async function getFeaturedCollectionsServer(): Promise<FeaturedCollection[]> {
  const response = await fetchServerApi<FeaturedCollection[]>("/collections/featured");
  return response.data ?? [];
}

export async function getDressesServer(filters?: DressFilters): Promise<DressesResponse> {
  const params = new URLSearchParams();

  if (filters?.collection) params.set("collection", filters.collection);
  if (filters?.style) params.set("style", filters.style);
  if (filters?.limit) params.set("limit", filters.limit.toString());
  if (filters?.offset) params.set("offset", filters.offset.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/dresses?${queryString}` : "/dresses";

  const response = await fetchServerApi<Dress[]>(endpoint);

  return {
    dresses: response.data ?? [],
    total: response.meta?.total ?? 0,
    limit: response.meta?.limit ?? 20,
    offset: response.meta?.offset ?? 0,
  };
}

export async function getDressServer(slug: string): Promise<Dress | null> {
  const response = await fetchServerApi<Dress>(`/dresses/${slug}`);
  return response.success ? response.data ?? null : null;
}

export async function getStylesServer(): Promise<Style[]> {
  const response = await fetchServerApi<Style[]>("/styles");
  return response.data ?? [];
}

export async function getHeroSlidesServer(): Promise<HeroSlide[]> {
  const response = await fetchServerApi<HeroSlide[]>("/hero-slides");
  return response.data ?? [];
}

export async function getSocialLinksServer(): Promise<SocialLink[]> {
  const response = await fetchServerApi<SocialLink[]>("/social-links");
  return response.data ?? [];
}

export async function getSettingsServer(): Promise<Settings> {
  const response = await fetchServerApi<Settings>("/settings");
  return response.data ?? {};
}

export async function getContentServer(): Promise<Content> {
  const response = await fetchServerApi<Content>("/content");
  return (
    response.data ?? {
      brandStatement: { en: "", uk: "" },
      aboutContent: { en: "", uk: "" },
      ctaBanner: { image: "", text: { en: "", uk: "" } },
    }
  );
}
