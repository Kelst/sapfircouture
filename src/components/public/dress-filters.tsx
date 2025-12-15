"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function DressFilters() {
  const t = useTranslations("catalog.filters");

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("style")}</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={t("all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="a-line">A-Line</SelectItem>
            <SelectItem value="ball-gown">Ball Gown</SelectItem>
            <SelectItem value="mermaid">Mermaid</SelectItem>
            <SelectItem value="sheath">Sheath</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("color")}</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={t("all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="ivory">Ivory</SelectItem>
            <SelectItem value="champagne">Champagne</SelectItem>
            <SelectItem value="blush">Blush</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("price")}</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={t("all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid">Mid-Range</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}
