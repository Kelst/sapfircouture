import { getTranslations, getLocale } from "next-intl/server";
import { ContactForm } from "@/components/public/contact-form";
import { SocialLinks } from "@/components/public/social-links";
import { getSettingsServer, getSocialLinksServer } from "@/lib/api/client";
import { getOrderInfoSettings } from "@/actions/settings.actions";
import { Phone, Mail, MapPin, Clock, ShoppingBag, Truck, CreditCard } from "lucide-react";

export default async function ContactsPage() {
  const t = await getTranslations("contacts");
  const tFooter = await getTranslations("footer");
  const locale = await getLocale();

  const [settings, socialLinks, orderInfo] = await Promise.all([
    getSettingsServer(),
    getSocialLinksServer(),
    getOrderInfoSettings(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="relative bg-ivory pt-20 pb-10 md:pt-28 md:pb-14">
        <div className="container text-center">
          <h1 className="font-serif text-h1 font-light tracking-wide text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact Form */}
            <div>
              <h2 className="font-serif text-h3 font-light mb-8">
                {t("formTitle")}
              </h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="lg:pl-12 lg:border-l border-muted/30">
              <h2 className="font-serif text-h3 font-light mb-8">
                {t("infoTitle")}
              </h2>

              <div className="space-y-8">
                {/* Address */}
                {settings.address && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{tFooter("contact")}</h3>
                      <p className="text-muted-foreground">{settings.address}</p>
                      {settings.google_maps_url && (
                        <a
                          href={settings.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-sm text-gold hover:underline"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {settings.contact_phones && settings.contact_phones.length > 0 && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{t("phone")}</h3>
                      <div className="space-y-1">
                        {settings.contact_phones.map((phone, index) => (
                          <a
                            key={index}
                            href={`tel:${phone.replace(/\s/g, "")}`}
                            className="block text-muted-foreground hover:text-gold transition-colors"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {settings.contact_email && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{t("email")}</h3>
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="text-muted-foreground hover:text-gold transition-colors"
                      >
                        {settings.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {settings.working_hours && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{tFooter("hours")}</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {settings.working_hours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="pt-8 border-t border-muted/30">
                    <h3 className="font-medium mb-2">{t("followUs")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("followUsDescription")}</p>
                    <SocialLinks links={socialLinks} iconSize="lg" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Information Section */}
      {(orderInfo.orderSteps.length > 0 || orderInfo.deliveryInfo.length > 0 || orderInfo.paymentMethods.length > 0) && (
        <section className="py-16 bg-ivory">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-12">
              {/* How to Order */}
              {orderInfo.orderSteps.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-gold" />
                    </div>
                    <h2 className="font-serif text-h4 font-light">
                      {t("howToOrder")}
                    </h2>
                  </div>
                  <ol className="space-y-4">
                    {orderInfo.orderSteps
                      .sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                        <li key={step.id} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white text-sm flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">
                            {locale === "uk" ? step.stepUk : step.stepEn}
                          </span>
                        </li>
                      ))}
                  </ol>
                  {/* Social Links for ordering */}
                  {socialLinks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-muted/30">
                      <SocialLinks links={socialLinks} iconSize="md" />
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Information */}
              {orderInfo.deliveryInfo.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-gold" />
                    </div>
                    <h2 className="font-serif text-h4 font-light">
                      {t("delivery")}
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    {orderInfo.deliveryInfo
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <li key={item.id}>
                          <p className="font-medium text-foreground">
                            {locale === "uk" ? item.titleUk : item.titleEn}
                          </p>
                          {(item.descriptionEn || item.descriptionUk) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {locale === "uk" ? item.descriptionUk : item.descriptionEn}
                            </p>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Payment Methods */}
              {orderInfo.paymentMethods.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gold" />
                    </div>
                    <h2 className="font-serif text-h4 font-light">
                      {t("payment")}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {orderInfo.paymentMethods
                      .sort((a, b) => a.order - b.order)
                      .map((method) => (
                        <li
                          key={method.id}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                          {locale === "uk" ? method.nameUk : method.nameEn}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Map Section */}
      {settings.google_maps_url && (
        <section className="h-[400px] bg-pearl">
          <iframe
            src={settings.google_maps_url}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale hover:grayscale-0 transition-all duration-500"
          />
        </section>
      )}
    </main>
  );
}
