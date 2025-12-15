"use server";

import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  createSocialLinkSchema,
  updateSocialLinkSchema,
  type CreateSocialLinkInput,
  type UpdateSocialLinkInput,
} from "@/lib/validators/social-link";

export async function getSocialLinks() {
  return db.query.socialLinks.findMany({
    orderBy: [asc(socialLinks.order)],
  });
}

export async function getSocialLinkById(id: string) {
  return db.query.socialLinks.findFirst({
    where: eq(socialLinks.id, id),
  });
}

export async function getEnabledSocialLinks() {
  return db.query.socialLinks.findMany({
    where: eq(socialLinks.enabled, true),
    orderBy: [asc(socialLinks.order)],
  });
}

export async function createSocialLink(input: CreateSocialLinkInput) {
  await requireAdmin();
  const validated = createSocialLinkSchema.parse(input);

  // Get the max order value
  const existing = await db.query.socialLinks.findMany({
    orderBy: [asc(socialLinks.order)],
  });
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((l) => l.order)) + 1 : 0;

  const [link] = await db
    .insert(socialLinks)
    .values({
      ...validated,
      order: maxOrder,
    })
    .returning();

  revalidatePath("/admin/social-media");
  return link;
}

export async function updateSocialLink(id: string, input: UpdateSocialLinkInput) {
  await requireAdmin();
  const validated = updateSocialLinkSchema.parse(input);

  const [link] = await db
    .update(socialLinks)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(socialLinks.id, id))
    .returning();

  revalidatePath("/admin/social-media");
  return link;
}

export async function deleteSocialLink(id: string) {
  await requireAdmin();

  await db.delete(socialLinks).where(eq(socialLinks.id, id));

  revalidatePath("/admin/social-media");
  return { success: true };
}

export async function reorderSocialLinks(ids: string[]) {
  await requireAdmin();

  await Promise.all(
    ids.map((id, index) =>
      db
        .update(socialLinks)
        .set({ order: index, updatedAt: new Date() })
        .where(eq(socialLinks.id, id))
    )
  );

  revalidatePath("/admin/social-media");
  return { success: true };
}
