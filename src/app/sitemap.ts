import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { dresses, collections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sapfircouture.com";
  const locales = ["en", "uk"];

  // Static pages
  const staticPages = ["", "/catalog", "/about", "/contacts"];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === "en" ? "" : `/${locale}`}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly" as const,
      priority: page === "" ? 1.0 : page === "/catalog" ? 0.9 : 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          uk: `${baseUrl}/uk${page}`,
        },
      },
    }))
  );

  // Dynamic pages - published dresses
  const publishedDresses = await db
    .select({
      slug: dresses.slug,
      updatedAt: dresses.updatedAt,
    })
    .from(dresses)
    .where(eq(dresses.isPublished, true));

  const dressEntries: MetadataRoute.Sitemap = publishedDresses.flatMap((dress) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === "en" ? "" : `/${locale}`}/catalog/${dress.slug}`,
      lastModified: dress.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/catalog/${dress.slug}`,
          uk: `${baseUrl}/uk/catalog/${dress.slug}`,
        },
      },
    }))
  );

  // Collection pages (filtered catalog)
  const allCollections = await db
    .select({
      slug: collections.slug,
      createdAt: collections.createdAt,
    })
    .from(collections);

  const collectionEntries: MetadataRoute.Sitemap = allCollections.flatMap((collection) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === "en" ? "" : `/${locale}`}/catalog?collection=${collection.slug}`,
      lastModified: collection.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/catalog?collection=${collection.slug}`,
          uk: `${baseUrl}/uk/catalog?collection=${collection.slug}`,
        },
      },
    }))
  );

  return [...staticEntries, ...dressEntries, ...collectionEntries];
}
