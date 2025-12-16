import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const slides = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true))
      .orderBy(asc(heroSlides.order));

    return NextResponse.json({
      success: true,
      data: slides.map((slide) => ({
        id: slide.id,
        image: slide.image,
        titleEn: slide.titleEn,
        titleUk: slide.titleUk,
        subtitleEn: slide.subtitleEn,
        subtitleUk: slide.subtitleUk,
        linkUrl: slide.linkUrl,
        order: slide.order,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch hero slides:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch hero slides", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
