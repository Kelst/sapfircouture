import { getHeroSlides } from "@/actions/hero-slides.actions";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";

export default async function HeroSlidesPage() {
  const slides = await getHeroSlides();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hero Slides</h1>
        <p className="text-muted-foreground">
          Manage homepage hero slider images and content
        </p>
      </div>

      <HeroSlidesManager initialSlides={slides} />
    </div>
  );
}
