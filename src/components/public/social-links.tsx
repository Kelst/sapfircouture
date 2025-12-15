import { Button } from "@/components/ui/button";

// TODO: Replace with actual social media icons and links from settings
const socialLinks = [
  { name: "Instagram", url: "#", icon: "IG" },
  { name: "Facebook", url: "#", icon: "FB" },
  { name: "TikTok", url: "#", icon: "TT" },
];

export function SocialLinks() {
  return (
    <div className="flex gap-2">
      {socialLinks.map((social) => (
        <Button
          key={social.name}
          variant="outline"
          size="icon"
          asChild
        >
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
          >
            <span className="text-xs font-bold">{social.icon}</span>
          </a>
        </Button>
      ))}
    </div>
  );
}
