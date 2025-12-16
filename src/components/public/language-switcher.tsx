"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "EN", fullName: "English" },
  { code: "uk", name: "UK", fullName: "Українська" },
] as const;

interface LanguageSwitcherProps {
  variant?: "default" | "transparent";
}

export function LanguageSwitcher({ variant = "default" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          <button
            onClick={() => switchLocale(lang.code)}
            className={cn(
              "text-xs font-sans font-medium tracking-wider transition-all duration-300",
              "hover:text-gold focus:outline-none",
              locale === lang.code
                ? "text-gold"
                : variant === "transparent"
                ? "text-foreground/70"
                : "text-muted-foreground"
            )}
            aria-label={`Switch to ${lang.fullName}`}
            aria-current={locale === lang.code ? "true" : undefined}
          >
            {lang.name}
          </button>
          {index < languages.length - 1 && (
            <span
              className={cn(
                "mx-2 text-xs",
                variant === "transparent"
                  ? "text-foreground/30"
                  : "text-muted-foreground/50"
              )}
            >
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
