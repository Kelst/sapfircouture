"use server";

import { db } from "@/lib/db";
import { dresses } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  createDressSchema,
  updateDressSchema,
  type CreateDressInput,
  type UpdateDressInput,
} from "@/lib/validators/dress";

export async function getDresses() {
  return db.query.dresses.findMany({
    orderBy: (dresses, { desc }) => [desc(dresses.createdAt)],
    with: {
      collection: true,
      style: true,
    },
  });
}

export async function getDressesByCollection(collectionId: string) {
  return db.query.dresses.findMany({
    where: eq(dresses.collectionId, collectionId),
    orderBy: (dresses, { asc }) => [asc(dresses.order)],
    with: {
      style: true,
    },
  });
}

export async function getDressBySlug(slug: string) {
  return db.query.dresses.findFirst({
    where: eq(dresses.slug, slug),
    with: {
      collection: true,
      style: true,
    },
  });
}

export async function getDressById(id: string) {
  return db.query.dresses.findFirst({
    where: eq(dresses.id, id),
    with: {
      collection: true,
      style: true,
    },
  });
}

export async function createDress(input: CreateDressInput) {
  await requireAdmin();
  const validated = createDressSchema.parse(input);

  const [dress] = await db
    .insert(dresses)
    .values(validated)
    .returning();

  revalidatePath("/catalog");
  revalidatePath(`/admin/collections/${validated.collectionId}`);

  return dress;
}

export async function updateDress(id: string, input: UpdateDressInput) {
  await requireAdmin();
  const validated = updateDressSchema.parse(input);

  const [dress] = await db
    .update(dresses)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(dresses.id, id))
    .returning();

  revalidatePath("/catalog");
  if (validated.collectionId) {
    revalidatePath(`/admin/collections/${validated.collectionId}`);
  }

  return dress;
}

export async function deleteDress(id: string) {
  await requireAdmin();

  const dress = await getDressById(id);
  await db.delete(dresses).where(eq(dresses.id, id));

  revalidatePath("/catalog");
  if (dress?.collectionId) {
    revalidatePath(`/admin/collections/${dress.collectionId}`);
  }
}

export async function toggleDressPublished(id: string, isPublished: boolean) {
  await requireAdmin();

  const [dress] = await db
    .update(dresses)
    .set({ isPublished, updatedAt: new Date() })
    .where(eq(dresses.id, id))
    .returning();

  revalidatePath("/catalog");

  return dress;
}

export async function reorderDresses(collectionId: string, orderedIds: string[]) {
  await requireAdmin();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(dresses)
        .set({ order: index, updatedAt: new Date() })
        .where(and(eq(dresses.id, id), eq(dresses.collectionId, collectionId)))
    )
  );

  revalidatePath(`/admin/collections/${collectionId}`);
}

export async function bulkToggleDressesPublished(ids: string[], isPublished: boolean) {
  await requireAdmin();

  await db
    .update(dresses)
    .set({ isPublished, updatedAt: new Date() })
    .where(inArray(dresses.id, ids));

  revalidatePath("/catalog");
  revalidatePath("/admin/collections");
}

export async function bulkDeleteDresses(ids: string[], collectionId: string) {
  await requireAdmin();

  await db.delete(dresses).where(inArray(dresses.id, ids));

  revalidatePath("/catalog");
  revalidatePath(`/admin/collections/${collectionId}`);
}
