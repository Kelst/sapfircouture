// Telegram Bot Notifications
// TODO: Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface ContactNotification {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  dressName?: string;
  locale?: string;
}

export async function sendTelegramNotification(
  notification: ContactNotification
): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Telegram bot not configured");
    return false;
  }

  const text = formatContactMessage(notification);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
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
