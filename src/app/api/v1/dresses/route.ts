import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dresses, collections, styles } from "@/lib/db/schema";
import { eq, and, asc, count, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collectionSlug = searchParams.get("collection");
    const styleId = searchParams.get("style");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build conditions
    const conditions: SQL<unknown>[] = [eq(dresses.isPublished, true)];

    // Filter by collection slug
    let collectionId: string | null = null;
    if (collectionSlug) {
      const collection = await db.query.collections.findFirst({
        where: eq(collections.slug, collectionSlug),
      });
      if (collection) {
        collectionId = collection.id;
        conditions.push(eq(dresses.collectionId, collection.id));
      }
    }

    // Filter by style
    if (styleId) {
      conditions.push(eq(dresses.styleId, styleId));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(dresses)
      .where(and(...conditions));

    // Get dresses with pagination
    const allDresses = await db
      .select({
        id: dresses.id,
        name: dresses.name,
        slug: dresses.slug,
        description: dresses.description,
        images: dresses.images,
        videos: dresses.videos,
        order: dresses.order,
        createdAt: dresses.createdAt,
        collection: {
          id: collections.id,
          name: collections.name,
          slug: collections.slug,
        },
        style: {
          id: styles.id,
          name: styles.name,
        },
      })
      .from(dresses)
      .leftJoin(collections, eq(dresses.collectionId, collections.id))
      .leftJoin(styles, eq(dresses.styleId, styles.id))
      .where(and(...conditions))
      .orderBy(asc(dresses.order))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: allDresses,
      meta: {
        total: totalResult?.count ?? 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Failed to fetch dresses:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch dresses", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
