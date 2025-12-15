import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sapfir Couture - Wedding Salon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
