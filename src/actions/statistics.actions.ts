"use server";

import { db } from "@/lib/db";
import { dresses, dressViews, collections } from "@/lib/db/schema";
import { desc, gte, count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/helpers";

export interface ViewsStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
}

export interface TopDress {
  id: string;
  name: string;
  slug: string;
  viewCount: number;
  collectionName: string | null;
}

/**
 * Get aggregated views statistics
 */
export async function getViewsStats(): Promise<ViewsStats> {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, today, week, month] = await Promise.all([
    db.select({ count: count() }).from(dressViews),
    db
      .select({ count: count() })
      .from(dressViews)
      .where(gte(dressViews.viewedAt, todayStart)),
    db
      .select({ count: count() })
      .from(dressViews)
      .where(gte(dressViews.viewedAt, weekStart)),
    db
      .select({ count: count() })
      .from(dressViews)
      .where(gte(dressViews.viewedAt, monthStart)),
  ]);

  return {
    totalViews: total[0]?.count ?? 0,
    todayViews: today[0]?.count ?? 0,
    weekViews: week[0]?.count ?? 0,
    monthViews: month[0]?.count ?? 0,
  };
}

/**
 * Get top dresses by view count
 */
export async function getTopDresses(limit: number = 10): Promise<TopDress[]> {
  await requireAdmin();

  const result = await db
    .select({
      id: dresses.id,
      name: dresses.name,
      slug: dresses.slug,
      viewCount: dresses.viewCount,
      collectionName: collections.name,
    })
    .from(dresses)
    .leftJoin(collections, eq(dresses.collectionId, collections.id))
    .where(gte(dresses.viewCount, 1))
    .orderBy(desc(dresses.viewCount))
    .limit(limit);

  return result;
}

/**
 * Get total dress count
 */
export async function getDressCount(): Promise<number> {
  await requireAdmin();

  const [result] = await db.select({ count: count() }).from(dresses);
  return result?.count ?? 0;
}
