import { getSocialLinks } from "@/actions/social-link.actions";
import { SocialLinksManager } from "@/components/admin/social-links-manager";

export default async function SocialMediaPage() {
  const links = await getSocialLinks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Social Media</h1>
        <p className="text-muted-foreground">
          Manage your social media links
        </p>
      </div>

      <SocialLinksManager initialLinks={links} />
    </div>
  );
}
