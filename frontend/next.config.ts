import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Derive API URL from environment variable with better error handling
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const url = (() => {
  try {
    return new URL(apiUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_URL: "${apiUrl}". Expected a fully qualified URL including the protocol, e.g. "http://localhost:3001" or "https://api.example.com".`,
    );
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/uploads/**",
      },
      // Cloudflare R2 / Images for production
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestream.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: "attachment",
    unoptimized: process.env.NODE_ENV === "development",
  },

  async headers() {
    return [
      {
        source: "/uploads/:path*(svg|SVG)",
        headers: [
          {
            key: "Content-Disposition",
            value: "inline",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; sandbox;",
          },
        ],
      },
    ];
  },

  // Vercel deployment optimizations
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
};

export default withNextIntl(nextConfig);
