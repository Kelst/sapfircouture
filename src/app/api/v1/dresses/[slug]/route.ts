import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dresses, collections, styles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [dress] = await db
      .select({
        id: dresses.id,
        name: dresses.name,
        slug: dresses.slug,
        description: dresses.description,
        images: dresses.images,
        videos: dresses.videos,
        order: dresses.order,
        createdAt: dresses.createdAt,
        updatedAt: dresses.updatedAt,
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
      .where(and(eq(dresses.slug, slug), eq(dresses.isPublished, true)));

    if (!dress) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Dress not found", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dress,
    });
  } catch (error) {
    console.error("Failed to fetch dress:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch dress", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
