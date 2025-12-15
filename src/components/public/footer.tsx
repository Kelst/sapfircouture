import { Link } from "@/i18n/navigation";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sapfir Couture</h3>
            <p className="text-sm text-muted-foreground">
              Your dream wedding dress awaits.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
                Catalog
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contacts" className="text-sm text-muted-foreground hover:text-foreground">
                Contacts
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <SocialLinks />
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sapfir Couture. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
