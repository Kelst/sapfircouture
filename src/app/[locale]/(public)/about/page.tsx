import { getTranslations, getLocale } from "next-intl/server";
import { getContentServer } from "@/lib/api/client";
import { Crown, Gem, Sparkles } from "lucide-react";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();
  const content = await getContentServer();

  const aboutText = locale === "uk"
    ? content.aboutContent?.uk
    : content.aboutContent?.en;

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
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Brand Story */}
            {aboutText ? (
              <div className="prose prose-lg max-w-none text-center mb-16">
                <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
                  {aboutText}
                </p>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-center mb-16">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t("description")}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-8 bg-ivory rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Gem className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-light mb-3">
                  {t("features.quality.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("features.quality.description")}
                </p>
              </div>

              <div className="text-center p-8 bg-ivory rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-light mb-3">
                  {t("features.exclusive.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("features.exclusive.description")}
                </p>
              </div>

              <div className="text-center p-8 bg-ivory rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-light mb-3">
                  {t("features.custom.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("features.custom.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
