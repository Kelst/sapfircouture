import { HeroSection } from "@/components/public/hero-section";
import { BrandStatement } from "@/components/public/brand-statement";
import { FeaturedCollections } from "@/components/public/featured-collections";
import { CtaBanner } from "@/components/public/cta-banner";
import {
  getHeroSlidesServer,
  getFeaturedCollectionsServer,
  getContentServer,
} from "@/lib/api/client";

export default async function HomePage() {
  // Fetch all data in parallel on the server
  const [heroSlides, featuredCollections, content] = await Promise.all([
    getHeroSlidesServer(),
    getFeaturedCollectionsServer(),
    getContentServer(),
  ]);

  return (
    <main>
      {/* Hero Section - Full screen image slider with Ken Burns effect */}
      <HeroSection slides={heroSlides} />

      {/* Brand Statement - Elegant quote section */}
      <BrandStatement content={content} />

      {/* Featured Collections - Asymmetric gallery layout */}
      <FeaturedCollections collections={featuredCollections} />

      {/* CTA Banner - Book a fitting call-to-action */}
      <CtaBanner content={content} />
    </main>
  );
}
