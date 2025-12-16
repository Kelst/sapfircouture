"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const t = useTranslations("dress");

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
      });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <button
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
      {t("share")}
    </button>
  );
}
