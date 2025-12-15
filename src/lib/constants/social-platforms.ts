export const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube" },
  { id: "pinterest", name: "Pinterest" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "telegram", name: "Telegram" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "twitter", name: "X (Twitter)" },
  { id: "viber", name: "Viber" },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"];

export function getPlatformName(id: string): string {
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === id);
  return platform?.name ?? id;
}

export function getPlatformIcon(id: string): string {
  return `/icons/social/${id}.svg`;
}
