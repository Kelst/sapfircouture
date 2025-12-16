import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, dresses } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get featured collections
    const featuredCollections = await db.query.collections.findMany({
      where: eq(collections.isFeatured, true),
      orderBy: [asc(collections.order)],
      with: {
        dresses: {
          where: eq(dresses.isPublished, true),
          limit: 1,
          orderBy: [asc(dresses.order)],
          columns: {
            images: true,
          },
        },
      },
    });

    // Format response with cover image (first dress image)
    const collectionsWithCover = featuredCollections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      coverImage: collection.dresses[0]?.images[0] || null,
    }));

    return NextResponse.json({
      success: true,
      data: collectionsWithCover,
    });
  } catch (error) {
    console.error("Failed to fetch featured collections:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch featured collections", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
