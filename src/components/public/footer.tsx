"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "./social-links";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/api/client";
import type { Settings } from "@/types/api";

export function Footer() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchSettings();
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/catalog", label: t("catalog") },
    { href: "/about", label: t("about") },
    { href: "/contacts", label: t("contacts") },
  ];

  // Check if contact/hours sections have data
  const hasContact = !!(settings.contact_phones?.length || settings.contact_email || settings.address);
  const hasHours = !!settings.working_hours;

  // Calculate number of columns: Brand + Navigation + Contact? + Hours?
  const columnCount = 2 + (hasContact ? 1 : 0) + (hasHours ? 1 : 0);

  const gridClasses = {
    2: "md:grid-cols-2 max-w-2xl mx-auto",
    3: "md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columnCount];

  return (
    <footer className="bg-champagne">
      {/* Main Footer Content */}
      <div className="container py-16 md:py-20">
        <div className={`grid gap-12 ${gridClasses}`}>
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <h3 className="font-serif text-2xl tracking-widest">
                <span className="text-foreground">SAPFIR</span>
                <span className="text-gold ml-1">COUTURE</span>
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {tFooter("tagline")}
            </p>
            <SocialLinks iconSize="sm" />
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-foreground">
              {tFooter("navigation")}
            </h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info - show only if has data */}
          {(settings.contact_phones?.length || settings.contact_email || settings.address) && (
            <div>
              <h4 className="font-serif text-lg mb-6 text-foreground">
                {tFooter("contact")}
              </h4>
              <div className="flex flex-col gap-4">
                {settings.contact_phones && settings.contact_phones.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      {settings.contact_phones.map((phone, index) => (
                        <a
                          key={index}
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {settings.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
                    >
                      {settings.contact_email}
                    </a>
                  </div>
                )}

                {settings.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {settings.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working Hours - show only if has data */}
          {settings.working_hours && (
            <div>
              <h4 className="font-serif text-lg mb-6 text-foreground">
                {tFooter("hours")}
              </h4>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground whitespace-pre-line">
                  {settings.working_hours}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold/20">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground tracking-wider">
            &copy; {new Date().getFullYear()} SAPFIR COUTURE. {tFooter("rights")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-gold transition-colors duration-300 tracking-wider"
            >
              {tFooter("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-gold transition-colors duration-300 tracking-wider"
            >
              {tFooter("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
