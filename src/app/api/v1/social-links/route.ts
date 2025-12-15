import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getPlatformName, getPlatformIcon } from "@/lib/constants/social-platforms";

export async function GET() {
  try {
    const links = await db
      .select({
        id: socialLinks.id,
        platform: socialLinks.platform,
        url: socialLinks.url,
        order: socialLinks.order,
      })
      .from(socialLinks)
      .where(eq(socialLinks.enabled, true))
      .orderBy(asc(socialLinks.order));

    // Add platform name and icon URL
    const linksWithMeta = links.map((link) => ({
      ...link,
      name: getPlatformName(link.platform),
      icon: getPlatformIcon(link.platform),
    }));

    return NextResponse.json({
      success: true,
      data: linksWithMeta,
    });
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch social links", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
