import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function TermsPage() {
  const t = await getTranslations("terms");

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-ivory py-16 md:py-20">
        <div className="container text-center">
          <h1 className="font-serif text-h1 font-light tracking-wide text-foreground mb-4">
            {t("title")}
          </h1>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("back")}
          </Link>

          <div className="prose prose-neutral max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("lastUpdated")}
            </p>

            <h2 className="font-serif text-xl font-light mt-8 mb-4">{t("sections.usage.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("sections.usage.content")}
            </p>

            <h2 className="font-serif text-xl font-light mt-8 mb-4">{t("sections.content.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("sections.content.content")}
            </p>

            <h2 className="font-serif text-xl font-light mt-8 mb-4">{t("sections.liability.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("sections.liability.content")}
            </p>

            <h2 className="font-serif text-xl font-light mt-8 mb-4">{t("sections.contact.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("sections.contact.content")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
