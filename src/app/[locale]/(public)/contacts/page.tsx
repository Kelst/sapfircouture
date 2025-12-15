import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/public/contact-form";
import { SocialLinks } from "@/components/public/social-links";

export default function ContactsPage() {
  const t = useTranslations("contacts");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <ContactForm />
        </div>
        <div>
          <div className="bg-muted rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Follow Us</h2>
            <SocialLinks />
            {/* Map or additional contact info */}
          </div>
        </div>
      </div>
    </div>
  );
}
