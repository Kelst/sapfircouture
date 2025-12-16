import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dressViews } from "@/lib/db/schema";
import { lt, count } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET;
const RETENTION_DAYS = 90;

/**
 * Cleanup old view records (older than 90 days)
 *
 * To protect this endpoint, set CRON_SECRET in your environment
 * and call with Authorization header: Bearer <CRON_SECRET>
 *
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-views",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verify authorization
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const cutoffDate = new Date(
      Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    // Count records to be deleted
    const [beforeCount] = await db
      .select({ count: count() })
      .from(dressViews)
      .where(lt(dressViews.viewedAt, cutoffDate));

    // Delete old records
    await db.delete(dressViews).where(lt(dressViews.viewedAt, cutoffDate));

    return NextResponse.json({
      success: true,
      deleted: beforeCount?.count ?? 0,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: RETENTION_DAYS,
    });
  } catch (error) {
    console.error("[Cron] Cleanup views error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup views" },
      { status: 500 }
    );
  }
}
