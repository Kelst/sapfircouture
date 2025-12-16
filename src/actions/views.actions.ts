"use server";

import { db } from "@/lib/db";
import { dresses, dressViews } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import crypto from "crypto";

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /mediapartners/i,
  /lighthouse/i,
  /pingdom/i,
  /pagespeed/i,
  /gtmetrix/i,
];

function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

// In-memory rate limiting (simple implementation)
const viewsRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_VIEWS_PER_MINUTE = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = viewsRateLimit.get(ip);

  if (!record || now > record.resetAt) {
    viewsRateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (record.count >= MAX_VIEWS_PER_MINUTE) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Track a dress view - fire-and-forget, doesn't block page rendering
 */
export async function trackDressView(dressId: string): Promise<void> {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const locale = headersList.get("x-next-intl-locale") || "en";

    // Skip bots
    if (isBot(userAgent)) {
      return;
    }

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return;
    }

    // Create visitor hash for deduplication
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${ip}:${userAgent}`)
      .digest("hex");

    // Check for recent view from same visitor (30 min window)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentView = await db.query.dressViews.findFirst({
      where: and(
        eq(dressViews.dressId, dressId),
        eq(dressViews.visitorHash, visitorHash),
        gte(dressViews.viewedAt, thirtyMinutesAgo)
      ),
    });

    if (recentView) {
      return; // Already viewed recently
    }

    // Record view and increment counter in parallel
    await Promise.all([
      // Insert detailed view record
      db.insert(dressViews).values({
        dressId,
        visitorHash,
        ipAddress: ip,
        locale,
      }),
      // Increment view counter
      db
        .update(dresses)
        .set({
          viewCount: sql`${dresses.viewCount} + 1`,
        })
        .where(eq(dresses.id, dressId)),
    ]);
  } catch (error) {
    // Log but don't throw - this shouldn't affect user experience
    console.error("[Views] Failed to track view:", error);
  }
}
