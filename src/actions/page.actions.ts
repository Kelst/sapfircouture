"use server";

import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPages() {
  return db.query.pages.findMany();
}

export async function getPageBySlug(slug: string) {
  return db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  });
}

interface UpdatePageInput {
  title: string;
  content: string;
}

export async function updatePage(slug: string, input: UpdatePageInput) {
  const existingPage = await getPageBySlug(slug);

  if (existingPage) {
    const [page] = await db
      .update(pages)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(pages.slug, slug))
      .returning();

    revalidatePath(`/${slug}`);
    return page;
  } else {
    const [page] = await db
      .insert(pages)
      .values({ slug, ...input })
      .returning();

    revalidatePath(`/${slug}`);
    return page;
  }
}
