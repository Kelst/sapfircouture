"use server";

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";

export async function getSetting(key: string) {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  return setting?.value;
}

export async function getSettings() {
  const allSettings = await db.query.settings.findMany();
  return Object.fromEntries(allSettings.map((s) => [s.key, s.value]));
}

export async function setSetting(key: string, value: string) {
  const existing = await getSetting(key);

  if (existing !== undefined) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }

  revalidatePath("/admin/settings", "page");
}

export async function setSettings(newSettings: Record<string, string>) {
  for (const [key, value] of Object.entries(newSettings)) {
    await setSetting(key, value);
  }
}

// Telegram Settings
const TELEGRAM_BOT_TOKEN_KEY = "telegram_bot_token";
const TELEGRAM_CHAT_ID_KEY = "telegram_chat_id";

export async function getTelegramSettings() {
  const [botToken, chatId] = await Promise.all([
    getSetting(TELEGRAM_BOT_TOKEN_KEY),
    getSetting(TELEGRAM_CHAT_ID_KEY),
  ]);

  return {
    botToken: botToken ?? "",
    chatId: chatId ?? "",
    isConfigured: !!(botToken && chatId),
  };
}

export async function saveTelegramSettings(botToken: string, chatId: string) {
  await requireAdmin();

  await Promise.all([
    setSetting(TELEGRAM_BOT_TOKEN_KEY, botToken),
    setSetting(TELEGRAM_CHAT_ID_KEY, chatId),
  ]);

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function testTelegramConnection(botToken: string, chatId: string) {
  await requireAdmin();

  if (!botToken || !chatId) {
    return { success: false, error: "Bot token and Chat ID are required" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ Test message from Sapfir Couture Admin Panel\n\nTelegram notifications are configured correctly!",
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.description || "Failed to send test message",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

// Contact Settings
const CONTACT_SETTINGS_KEYS = {
  companyName: "company_name",
  phones: "contact_phones",
  email: "contact_email",
  address: "address",
  workingHours: "working_hours",
  googleMapsUrl: "google_maps_url",
} as const;

export interface ContactSettings {
  companyName: string;
  phones: string[];
  email: string;
  address: string;
  workingHours: string;
  googleMapsUrl: string;
}

export async function getContactSettings(): Promise<ContactSettings> {
  const [companyName, phones, email, address, workingHours, googleMapsUrl] =
    await Promise.all([
      getSetting(CONTACT_SETTINGS_KEYS.companyName),
      getSetting(CONTACT_SETTINGS_KEYS.phones),
      getSetting(CONTACT_SETTINGS_KEYS.email),
      getSetting(CONTACT_SETTINGS_KEYS.address),
      getSetting(CONTACT_SETTINGS_KEYS.workingHours),
      getSetting(CONTACT_SETTINGS_KEYS.googleMapsUrl),
    ]);

  return {
    companyName: companyName ?? "",
    phones: phones ? JSON.parse(phones) : [],
    email: email ?? "",
    address: address ?? "",
    workingHours: workingHours ?? "",
    googleMapsUrl: googleMapsUrl ?? "",
  };
}

export async function saveContactSettings(data: ContactSettings) {
  await requireAdmin();

  await Promise.all([
    setSetting(CONTACT_SETTINGS_KEYS.companyName, data.companyName),
    setSetting(CONTACT_SETTINGS_KEYS.phones, JSON.stringify(data.phones)),
    setSetting(CONTACT_SETTINGS_KEYS.email, data.email),
    setSetting(CONTACT_SETTINGS_KEYS.address, data.address),
    setSetting(CONTACT_SETTINGS_KEYS.workingHours, data.workingHours),
    setSetting(CONTACT_SETTINGS_KEYS.googleMapsUrl, data.googleMapsUrl),
  ]);

  revalidatePath("/admin/settings");
  return { success: true };
}

// Content Settings (Homepage & About page)
const CONTENT_SETTINGS_KEYS = {
  brandStatementEn: "brand_statement_en",
  brandStatementUk: "brand_statement_uk",
  aboutContentEn: "about_content_en",
  aboutContentUk: "about_content_uk",
  ctaBannerImage: "cta_banner_image",
  ctaBannerTextEn: "cta_banner_text_en",
  ctaBannerTextUk: "cta_banner_text_uk",
} as const;

export interface ContentSettings {
  brandStatementEn: string;
  brandStatementUk: string;
  aboutContentEn: string;
  aboutContentUk: string;
  ctaBannerImage: string;
  ctaBannerTextEn: string;
  ctaBannerTextUk: string;
}

export async function getContentSettings(): Promise<ContentSettings> {
  const [
    brandStatementEn,
    brandStatementUk,
    aboutContentEn,
    aboutContentUk,
    ctaBannerImage,
    ctaBannerTextEn,
    ctaBannerTextUk,
  ] = await Promise.all([
    getSetting(CONTENT_SETTINGS_KEYS.brandStatementEn),
    getSetting(CONTENT_SETTINGS_KEYS.brandStatementUk),
    getSetting(CONTENT_SETTINGS_KEYS.aboutContentEn),
    getSetting(CONTENT_SETTINGS_KEYS.aboutContentUk),
    getSetting(CONTENT_SETTINGS_KEYS.ctaBannerImage),
    getSetting(CONTENT_SETTINGS_KEYS.ctaBannerTextEn),
    getSetting(CONTENT_SETTINGS_KEYS.ctaBannerTextUk),
  ]);

  return {
    brandStatementEn: brandStatementEn ?? "",
    brandStatementUk: brandStatementUk ?? "",
    aboutContentEn: aboutContentEn ?? "",
    aboutContentUk: aboutContentUk ?? "",
    ctaBannerImage: ctaBannerImage ?? "",
    ctaBannerTextEn: ctaBannerTextEn ?? "",
    ctaBannerTextUk: ctaBannerTextUk ?? "",
  };
}

export async function saveContentSettings(data: ContentSettings) {
  await requireAdmin();

  await Promise.all([
    setSetting(CONTENT_SETTINGS_KEYS.brandStatementEn, data.brandStatementEn),
    setSetting(CONTENT_SETTINGS_KEYS.brandStatementUk, data.brandStatementUk),
    setSetting(CONTENT_SETTINGS_KEYS.aboutContentEn, data.aboutContentEn),
    setSetting(CONTENT_SETTINGS_KEYS.aboutContentUk, data.aboutContentUk),
    setSetting(CONTENT_SETTINGS_KEYS.ctaBannerImage, data.ctaBannerImage),
    setSetting(CONTENT_SETTINGS_KEYS.ctaBannerTextEn, data.ctaBannerTextEn),
    setSetting(CONTENT_SETTINGS_KEYS.ctaBannerTextUk, data.ctaBannerTextUk),
  ]);

  revalidatePath("/admin/settings");
  return { success: true };
}
