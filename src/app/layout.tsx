import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Kapyn — What happened in AI today",
  description:
    "Kapyn: Full-screen AI news cards. Swipe through the most important AI stories, summaries in 60 words.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kapyn",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%", overflow: "hidden" }}>
      <PostHogProvider>
      <body
        style={{
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <main
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            paddingBottom: "60px",
          }}
        >
          {children}
        </main>
        <BottomNav />
      </body>
      </PostHogProvider>
    </html>
  );
}
