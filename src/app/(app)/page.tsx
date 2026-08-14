import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/HomeFeed";
import { fetchNewsItems } from "@/lib/supabase";
import type { NewsItem } from "@/lib/types";

// Re-render the cached shell every 5 minutes. Ingestion runs every 2h, so this is
// far fresher than the content and keeps Supabase off the per-request path.
export const revalidate = 300;

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
