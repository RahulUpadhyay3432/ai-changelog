import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers guessing content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Allow same-origin iframing (landing page embeds the app)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop leaking full referrer URL to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Force HTTPS for 1 year once the custom domain is live
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Basic XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "kapyn.vercel.app" }],
        destination: "https://kapyn.app/:path*",
        permanent: true,
      },
      // The Claude-vs-GPT post was renamed when GPT-4o stopped being current
      // (Aug 2026). Keep the old URL alive so existing links and any accrued
      // ranking transfer to the rewritten piece.
      {
        source: "/blog/claude-vs-gpt4o-which-to-use-2026",
        destination: "/blog/claude-vs-gpt5-which-to-use-2026",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  skipTrailingSlashRedirect: true,
};

export default nextConfig;
