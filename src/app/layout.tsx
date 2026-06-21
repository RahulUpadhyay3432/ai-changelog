import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const APP_URL = "https://kapyn.app";

// Sitewide entity graph — establishes Kapyn as a known Organization + WebSite
// with a sitelinks search box. Lives only here (pages must not re-declare these
// nodes). Mirrors the JSON-LD injection pattern used on story/learn pages.
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "Kapyn",
      url: APP_URL,
      logo: `${APP_URL}/api/icon/512`,
      description:
        "The calm map of the AI worth using — agents, models, tools, MCP servers and skills.",
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      name: "Kapyn",
      url: APP_URL,
      publisher: { "@id": `${APP_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/explore?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  verification: {
    google: "vwiJeZYbR-J6Se91wicz3KZlpXtY8_YlWTxuZ7gRfjc",
  },
  title: {
    default: "Kapyn — What happened in AI today",
    template: "%s | Kapyn",
  },
  description:
    "AI and tech news distilled into 30-second reads. Every story that matters, no noise.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kapyn",
  },
  icons: {
    icon: [
      { url: "/api/icon/192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon/512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/icon/180", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Kapyn — What happened in AI today",
    description:
      "AI and tech news distilled into 30-second reads. Every story that matters, no noise.",
    url: APP_URL,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kapyn — What happened in AI today",
    description:
      "AI and tech news distilled into 30-second reads. Every story that matters, no noise.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0D0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <PostHogProvider>
        <body
          style={{
            margin: 0,
            background: "#0a0a0a",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <ServiceWorkerRegistrar />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
          />
          {children}
        </body>
      </PostHogProvider>
    </html>
  );
}
