"use server";

import { db } from "@/lib/db";
import { styles, dresses } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  createStyleSchema,
  updateStyleSchema,
  type CreateStyleInput,
  type UpdateStyleInput,
} from "@/lib/validators/style";

export async function getStyles() {
  return db.query.styles.findMany({
    orderBy: (styles, { asc }) => [asc(styles.nameEn)],
  });
}

export async function getStyleById(id: string) {
  return db.query.styles.findFirst({
    where: eq(styles.id, id),
  });
}

export async function createStyle(input: CreateStyleInput) {
  await requireAdmin();
  const validated = createStyleSchema.parse(input);

  // Check if style with this English name already exists
  const existing = await db.query.styles.findFirst({
    where: eq(styles.nameEn, validated.nameEn),
  });

  if (existing) {
    throw new Error("Style with this name already exists");
  }

  const [style] = await db
    .insert(styles)
    .values({
      nameEn: validated.nameEn,
      nameUk: validated.nameUk || null,
    })
    .returning();

  revalidatePath("/admin/styles");

  return style;
}

export async function updateStyle(id: string, input: UpdateStyleInput) {
  await requireAdmin();
  const validated = updateStyleSchema.parse(input);

  const updateData: { nameEn?: string; nameUk?: string | null; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (validated.nameEn !== undefined) {
    updateData.nameEn = validated.nameEn;
  }
  if (validated.nameUk !== undefined) {
    updateData.nameUk = validated.nameUk || null;
  }

  const [style] = await db
    .update(styles)
    .set(updateData)
    .where(eq(styles.id, id))
    .returning();

  revalidatePath("/admin/styles");

  return style;
}

export async function deleteStyle(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  // Check if any dresses are using this style
  const [result] = await db
    .select({ count: count() })
    .from(dresses)
    .where(eq(dresses.styleId, id));

  if (result.count > 0) {
    return {
      success: false,
      error: `Cannot delete style. It is used by ${result.count} ${result.count === 1 ? "dress" : "dresses"}.`,
    };
  }

  await db.delete(styles).where(eq(styles.id, id));

  revalidatePath("/admin/styles");

  return { success: true };
}
