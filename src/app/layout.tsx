import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kapyn — What happened in AI today",
  description: "The calm intelligence layer for AI",
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
          {children}
        </body>
      </PostHogProvider>
    </html>
  );
}
