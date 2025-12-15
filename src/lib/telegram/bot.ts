// Telegram Bot Notifications
// Settings can be configured via Admin Panel or environment variables

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ContactNotification {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  dressName?: string;
  locale?: string;
}

async function getTelegramCredentials(): Promise<{
  botToken: string | null;
  chatId: string | null;
}> {
  // First check environment variables (for deployment flexibility)
  const envBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const envChatId = process.env.TELEGRAM_CHAT_ID;

  if (envBotToken && envChatId) {
    return { botToken: envBotToken, chatId: envChatId };
  }

  // If not in env, try database settings
  try {
    const [botTokenSetting, chatIdSetting] = await Promise.all([
      db.query.settings.findFirst({
        where: eq(settings.key, "telegram_bot_token"),
      }),
      db.query.settings.findFirst({
        where: eq(settings.key, "telegram_chat_id"),
      }),
    ]);

    return {
      botToken: botTokenSetting?.value ?? null,
      chatId: chatIdSetting?.value ?? null,
    };
  } catch (error) {
    console.error("Failed to get Telegram settings from DB:", error);
    return { botToken: null, chatId: null };
  }
}

export async function sendTelegramNotification(
  notification: ContactNotification
): Promise<boolean> {
  const { botToken, chatId } = await getTelegramCredentials();

  if (!botToken || !chatId) {
    console.warn("Telegram bot not configured");
    return false;
  }

  const text = formatContactMessage(notification);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Telegram API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

function formatContactMessage(notification: ContactNotification): string {
  const lines = [
    "📩 <b>New Contact Request</b>",
    "",
    `👤 <b>Name:</b> ${escapeHtml(notification.name)}`,
    `📱 <b>Phone:</b> ${escapeHtml(notification.phone)}`,
  ];

  if (notification.email) {
    lines.push(`📧 <b>Email:</b> ${escapeHtml(notification.email)}`);
  }

  if (notification.dressName) {
    lines.push(`👗 <b>Dress:</b> ${escapeHtml(notification.dressName)}`);
  }

  if (notification.message) {
    lines.push("", `💬 <b>Message:</b>`, escapeHtml(notification.message));
  }

  if (notification.locale) {
    lines.push("", `🌐 <b>Language:</b> ${notification.locale.toUpperCase()}`);
  }

  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
