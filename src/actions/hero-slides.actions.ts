"use server";

import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";

export interface HeroSlideInput {
  image: string;
  titleEn?: string;
  titleUk?: string;
  subtitleEn?: string;
  subtitleUk?: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export async function getHeroSlides() {
  return db.query.heroSlides.findMany({
    orderBy: [asc(heroSlides.order)],
  });
}

export async function getActiveHeroSlides() {
  return db.query.heroSlides.findMany({
    where: eq(heroSlides.isActive, true),
    orderBy: [asc(heroSlides.order)],
  });
}

export async function getHeroSlide(id: string) {
  return db.query.heroSlides.findFirst({
    where: eq(heroSlides.id, id),
  });
}

export async function createHeroSlide(data: HeroSlideInput) {
  await requireAdmin();

  // Get max order
  const slides = await db.query.heroSlides.findMany({
    orderBy: [asc(heroSlides.order)],
  });
  const maxOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order)) : -1;

  const [slide] = await db
    .insert(heroSlides)
    .values({
      image: data.image,
      titleEn: data.titleEn || null,
      titleUk: data.titleUk || null,
      subtitleEn: data.subtitleEn || null,
      subtitleUk: data.subtitleUk || null,
      linkUrl: data.linkUrl || null,
      order: data.order ?? maxOrder + 1,
      isActive: data.isActive ?? true,
    })
    .returning();

  revalidatePath("/admin/hero-slides");
  return slide;
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlideInput>) {
  await requireAdmin();

  const [slide] = await db
    .update(heroSlides)
    .set({
      ...(data.image !== undefined && { image: data.image }),
      ...(data.titleEn !== undefined && { titleEn: data.titleEn || null }),
      ...(data.titleUk !== undefined && { titleUk: data.titleUk || null }),
      ...(data.subtitleEn !== undefined && { subtitleEn: data.subtitleEn || null }),
      ...(data.subtitleUk !== undefined && { subtitleUk: data.subtitleUk || null }),
      ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl || null }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(heroSlides.id, id))
    .returning();

  revalidatePath("/admin/hero-slides");
  return slide;
}

export async function deleteHeroSlide(id: string) {
  await requireAdmin();

  await db.delete(heroSlides).where(eq(heroSlides.id, id));

  revalidatePath("/admin/hero-slides");
  return { success: true };
}

export async function reorderHeroSlides(orderedIds: string[]) {
  await requireAdmin();

  // Update order for each slide
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(heroSlides)
        .set({ order: index, updatedAt: new Date() })
        .where(eq(heroSlides.id, id))
    )
  );

  revalidatePath("/admin/hero-slides");
  return { success: true };
}

export async function toggleHeroSlideActive(id: string) {
  await requireAdmin();

  const slide = await getHeroSlide(id);
  if (!slide) {
    throw new Error("Hero slide not found");
  }

  const [updatedSlide] = await db
    .update(heroSlides)
    .set({ isActive: !slide.isActive, updatedAt: new Date() })
    .where(eq(heroSlides.id, id))
    .returning();

  revalidatePath("/admin/hero-slides");
  return updatedSlide;
}
