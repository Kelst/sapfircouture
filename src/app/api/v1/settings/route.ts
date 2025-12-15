import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

// Public settings keys that can be exposed via API
const PUBLIC_SETTINGS_KEYS = [
  "company_name",
  "contact_phones",
  "contact_email",
  "address",
  "working_hours",
  "google_maps_url",
];

// Keys that should be parsed as JSON
const JSON_KEYS = ["contact_phones"];

export async function GET() {
  try {
    const publicSettings = await db
      .select({
        key: settings.key,
        value: settings.value,
      })
      .from(settings)
      .where(inArray(settings.key, PUBLIC_SETTINGS_KEYS));

    // Convert to object and parse JSON values
    const settingsObject = Object.fromEntries(
      publicSettings.map((s) => {
        if (JSON_KEYS.includes(s.key)) {
          try {
            return [s.key, JSON.parse(s.value)];
          } catch {
            return [s.key, s.value];
          }
        }
        return [s.key, s.value];
      })
    );

    return NextResponse.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch settings", code: "FETCH_ERROR" },
      },
      { status: 500 }
    );
  }
}
