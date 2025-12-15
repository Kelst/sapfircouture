import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, dresses } from "@/lib/db/schema";
import { asc, eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const allCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
        slug: collections.slug,
        description: collections.description,
        order: collections.order,
        createdAt: collections.createdAt,
      })
      .from(collections)
      .orderBy(asc(collections.order));

    // Get dress count for each collection
    const collectionsWithCount = await Promise.all(
      allCollections.map(async (collection) => {
        const [result] = await db
          .select({ count: count() })
          .from(dresses)
          .where(eq(dresses.collectionId, collection.id));

        return {
          ...collection,
          dressCount: result?.count ?? 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: collectionsWithCount,
    });
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch collections", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
