import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
      <div className="prose max-w-none">
        <p>{t("description")}</p>
        {/* Content will be loaded from CMS */}
      </div>
    </div>
  );
}
