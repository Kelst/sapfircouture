import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

// Public content keys
const PUBLIC_CONTENT_KEYS = [
  "brand_statement_en",
  "brand_statement_uk",
  "about_content_en",
  "about_content_uk",
  "cta_banner_image",
  "cta_banner_text_en",
  "cta_banner_text_uk",
];

export async function GET() {
  try {
    const contentSettings = await db
      .select({
        key: settings.key,
        value: settings.value,
      })
      .from(settings)
      .where(inArray(settings.key, PUBLIC_CONTENT_KEYS));

    // Convert to object
    const contentObject = Object.fromEntries(
      contentSettings.map((s) => [s.key, s.value])
    );

    return NextResponse.json({
      success: true,
      data: {
        brandStatement: {
          en: contentObject.brand_statement_en || "",
          uk: contentObject.brand_statement_uk || "",
        },
        aboutContent: {
          en: contentObject.about_content_en || "",
          uk: contentObject.about_content_uk || "",
        },
        ctaBanner: {
          image: contentObject.cta_banner_image || "",
          text: {
            en: contentObject.cta_banner_text_en || "",
            uk: contentObject.cta_banner_text_uk || "",
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch content", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
