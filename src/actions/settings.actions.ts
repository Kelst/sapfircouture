"use server";

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSetting(key: string) {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  return setting?.value;
}

export async function getSettings() {
  const allSettings = await db.query.settings.findMany();
  return Object.fromEntries(allSettings.map((s) => [s.key, s.value]));
}

export async function setSetting(key: string, value: string) {
  const existing = await getSetting(key);

  if (existing !== undefined) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }

  revalidatePath("/[locale]/admin/settings", "page");
}

export async function setSettings(newSettings: Record<string, string>) {
  for (const [key, value] of Object.entries(newSettings)) {
    await setSetting(key, value);
  }
}
