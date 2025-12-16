import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sapfir Couture - Premium Wedding Salon",
  description: "Discover elegance at Sapfir Couture - your destination for exquisite wedding dresses and bridal fashion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
