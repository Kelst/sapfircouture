import { useTranslations } from "next-intl";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { ContactForm } from "@/components/public/contact-form";

interface DressPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function DressPage({ params }: DressPageProps) {
  const { slug } = await params;
  const t = useTranslations("catalog");

  // TODO: Fetch dress data by slug

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <LightboxGallery images={[]} />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">Dress {slug}</h1>
          <p className="text-muted-foreground mb-6">
            {/* Description placeholder */}
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
