import { cn } from "@/lib/utils";
import type { SocialLink } from "@/types/api";
import { Instagram, Facebook, Youtube, Twitter, Phone, Mail, MapPin } from "lucide-react";

interface SocialLinksProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  links: SocialLink[];
}

// Map platform names to icons
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  tiktok: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  telegram: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  pinterest: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.633-.133-1.606.028-2.298.145-.625.938-3.977.938-3.977s-.239-.48-.239-1.188c0-1.112.645-1.944 1.448-1.944.683 0 1.012.512 1.012 1.127 0 .687-.437 1.714-.663 2.667-.189.796.4 1.446 1.185 1.446 1.422 0 2.515-1.5 2.515-3.664 0-1.915-1.377-3.254-3.342-3.254-2.276 0-3.612 1.707-3.612 3.47 0 .688.265 1.425.595 1.826a.24.24 0 0 1 .056.23c-.061.252-.196.796-.222.907-.035.146-.116.177-.268.107-1-.465-1.624-1.926-1.624-3.1 0-2.523 1.833-4.84 5.286-4.84 2.775 0 4.932 1.977 4.932 4.62 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.919l-.498 1.902c-.181.695-.669 1.566-.995 2.097A12 12 0 1 0 12 0z" />
    </svg>
  ),
  phone: Phone,
  email: Mail,
  location: MapPin,
};

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function SocialLinks({
  className,
  iconSize = "md",
  links,
}: SocialLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map((link) => {
        const IconComponent =
          platformIcons[link.platform.toLowerCase()] ||
          platformIcons[link.icon?.toLowerCase() ?? ""];

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-300",
              "text-muted-foreground hover:text-gold hover:scale-110",
              "border border-transparent hover:border-gold/30",
              iconSize === "sm" && "w-8 h-8",
              iconSize === "md" && "w-10 h-10",
              iconSize === "lg" && "w-12 h-12"
            )}
          >
            {IconComponent ? (
              <IconComponent className={sizeClasses[iconSize]} />
            ) : (
              <span className="text-xs font-medium uppercase">
                {link.platform.slice(0, 2)}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
