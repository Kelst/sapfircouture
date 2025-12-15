import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, dresses, styles } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const collection = await db.query.collections.findFirst({
      where: eq(collections.slug, slug),
    });

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Collection not found", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    // Get published dresses for this collection
    const collectionDresses = await db
      .select({
        id: dresses.id,
        name: dresses.name,
        slug: dresses.slug,
        description: dresses.description,
        images: dresses.images,
        videos: dresses.videos,
        order: dresses.order,
        style: {
          id: styles.id,
          name: styles.name,
        },
      })
      .from(dresses)
      .leftJoin(styles, eq(dresses.styleId, styles.id))
      .where(
        and(
          eq(dresses.collectionId, collection.id),
          eq(dresses.isPublished, true)
        )
      )
      .orderBy(asc(dresses.order));

    return NextResponse.json({
      success: true,
      data: {
        ...collection,
        dresses: collectionDresses,
      },
    });
  } catch (error) {
    console.error("Failed to fetch collection:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch collection", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
