import { useTranslations } from "next-intl";
import { DressGrid } from "@/components/public/dress-grid";
import { DressFilters } from "@/components/public/dress-filters";

export default function CatalogPage() {
  const t = useTranslations("catalog");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64">
          <DressFilters />
        </aside>
        <div className="flex-1">
          <DressGrid />
        </div>
      </div>
    </div>
  );
}
