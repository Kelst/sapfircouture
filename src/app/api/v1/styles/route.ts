import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { styles } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allStyles = await db
      .select({
        id: styles.id,
        nameEn: styles.nameEn,
        nameUk: styles.nameUk,
        createdAt: styles.createdAt,
      })
      .from(styles)
      .orderBy(asc(styles.nameEn));

    return NextResponse.json({
      success: true,
      data: allStyles,
    });
  } catch (error) {
    console.error("Failed to fetch styles:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch styles", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
