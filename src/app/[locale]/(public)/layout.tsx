import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { getSettingsServer, getSocialLinksServer } from "@/lib/api/client";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings and social links on the server (cached for 5 minutes)
  const [settings, socialLinks] = await Promise.all([
    getSettingsServer(),
    getSocialLinksServer(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer settings={settings} socialLinks={socialLinks} />
    </div>
  );
}
