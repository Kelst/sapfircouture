import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Parse S3 URL for image optimization (works for both dev and prod)
const s3Url = process.env.S3_PUBLIC_URL || "http://localhost:9000/wedding-uploads";
const s3UrlParsed = new URL(s3Url);

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: s3UrlParsed.protocol.replace(":", "") as "http" | "https",
        hostname: s3UrlParsed.hostname,
        port: s3UrlParsed.port || "",
        pathname: "/**",
      },
      // Fallback for local development with MinIO
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/wedding-uploads/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
