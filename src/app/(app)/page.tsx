import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/HomeFeed";
import { fetchNewsItems } from "@/lib/supabase";
import type { NewsItem } from "@/lib/types";

// Re-render the cached shell every 30 minutes. Ingestion runs every 2h, so this is
// still fresher than the content, and the client re-resolves the feed on mount.
// It was 5 minutes, which crawlers kept warm: ~290 full-feed reads a day.
export const revalidate = 1800;

// "/" serves three variants: cold desktop is rewritten to the /home landing,
// phones get the app shell, and cookie-holders get the app shell on any device
// (see src/middleware.ts). They are all the same homepage to a search engine, so
// "/" self-canonicalises here. Without this the mobile branch — the one Googlebot
// crawls with — emitted no canonical at all, and /home competed with it.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Server-fetch the default "all" feed so the first paint contains real stories.
 *
 * Before this, the document shipped only a "Loading..." fallback: the browser had
 * to download ~400KB of JS, hydrate, and complete a Supabase round trip before a
 * single headline appeared. That is what put LCP above 5s and left crawlers
 * looking at an empty page.
 *
 * `fetchNewsItems` is safe here — `getFeedPrefs()` returns null off-browser, so
 * the server renders the unpersonalized feed and the client re-resolves with the
 * user's own topic prefs after hydration.
 */
async function getInitialItems(): Promise<NewsItem[]> {
  try {
    return await fetchNewsItems("all", { rankOpener: true });
  } catch {
    // Never let a feed outage take the page down — fall back to the previous
    // client-only behaviour, which renders its own error/empty state.
    return [];
  }
}

export default async function HomePage() {
  const initialItems = await getInitialItems();

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--kt-canvas, #0a0a0a)",
            color: "var(--kt-text-muted, #525252)",
            fontSize: "14px",
          }}
        >
          Loading...
        </div>
      }
    >
      <HomeFeed initialItems={initialItems} />
    </Suspense>
  );
}
