import type { Metadata, Viewport } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sapfircouture.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Sapfir Couture - Premium Wedding Salon",
    template: "%s | Sapfir Couture",
  },
  description:
    "Discover elegance at Sapfir Couture - your destination for exquisite wedding dresses and bridal fashion. Book your private fitting today.",
  keywords: [
    "wedding dresses",
    "bridal salon",
    "wedding gowns",
    "bridal fashion",
    "весільні сукні",
    "весільний салон",
  ],
  authors: [{ name: "Sapfir Couture" }],
  creator: "Sapfir Couture",
  publisher: "Sapfir Couture",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Sapfir Couture",
    locale: "en_US",
    alternateLocale: "uk_UA",
    title: "Sapfir Couture - Premium Wedding Salon",
    description:
      "Discover elegance at Sapfir Couture - your destination for exquisite wedding dresses and bridal fashion.",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sapfir Couture - Premium Wedding Salon",
    description:
      "Discover elegance at Sapfir Couture - your destination for exquisite wedding dresses and bridal fashion.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
