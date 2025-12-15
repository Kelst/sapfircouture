"use server";

import { db } from "@/lib/db";
import { collections, dresses } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  createCollectionSchema,
  updateCollectionSchema,
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from "@/lib/validators/collection";

export async function getCollections() {
  return db.query.collections.findMany({
    orderBy: (collections, { asc }) => [asc(collections.order), asc(collections.name)],
    with: {
      dresses: {
        columns: { id: true },
      },
    },
  });
}

export async function getCollectionById(id: string) {
  return db.query.collections.findFirst({
    where: eq(collections.id, id),
    with: {
      dresses: {
        orderBy: (dresses, { asc }) => [asc(dresses.order)],
        with: {
          style: true,
        },
      },
    },
  });
}

export async function getCollectionBySlug(slug: string) {
  return db.query.collections.findFirst({
    where: eq(collections.slug, slug),
    with: {
      dresses: {
        where: (dresses, { eq }) => eq(dresses.isPublished, true),
        orderBy: (dresses, { asc }) => [asc(dresses.order)],
        with: {
          style: true,
        },
      },
    },
  });
}

export async function createCollection(input: CreateCollectionInput) {
  await requireAdmin();
  const validated = createCollectionSchema.parse(input);

  const [collection] = await db
    .insert(collections)
    .values(validated)
    .returning();

  revalidatePath("/admin/collections");
  revalidatePath("/catalog");

  return collection;
}

export async function updateCollection(id: string, input: UpdateCollectionInput) {
  await requireAdmin();
  const validated = updateCollectionSchema.parse(input);

  const [collection] = await db
    .update(collections)
    .set(validated)
    .where(eq(collections.id, id))
    .returning();

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  revalidatePath("/catalog");

  return collection;
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  // Check if collection has any dresses
  const [result] = await db
    .select({ count: count() })
    .from(dresses)
    .where(eq(dresses.collectionId, id));

  if (result.count > 0) {
    return {
      success: false,
      error: `Cannot delete collection. It contains ${result.count} ${result.count === 1 ? "dress" : "dresses"}. Please delete or move the dresses first.`,
    };
  }

  await db.delete(collections).where(eq(collections.id, id));

  revalidatePath("/admin/collections");
  revalidatePath("/catalog");

  return { success: true };
}

export async function reorderCollections(orderedIds: string[]) {
  await requireAdmin();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(collections)
        .set({ order: index })
        .where(eq(collections.id, id))
    )
  );

  revalidatePath("/admin/collections");
  revalidatePath("/catalog");
}
