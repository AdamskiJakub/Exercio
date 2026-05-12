import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Derive API URL from environment variable with better error handling
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const url = (() => {
  try {
    return new URL(apiUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_URL: "${apiUrl}". Expected a fully qualified URL including the protocol, e.g. "http://localhost:3001" or "https://api.example.com".`
    );
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        port: url.port,
        pathname: '/uploads/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
