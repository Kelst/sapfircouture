import { useTranslations } from "next-intl";
import { HeroSection } from "@/components/public/hero-section";

export default function HomePage() {
  const t = useTranslations("hero");

  return (
    <>
      <HeroSection />
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t("subtitle")}
        </h2>
        {/* Featured dresses will go here */}
      </section>
    </>
  );
}
