import type { NewsItem } from "./types";

// ── Breakdown ("Why it matters") cache ───────────────────────────────────────
// Session-level cache so a story's AI breakdown is fetched at most once, and so
// prefetching (as the user scrolls) makes the eventual tap instant. `inflight`
// dedupes concurrent requests — a prefetch and a click for the same story share
// one network call.

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

export function getCachedBreakdown(id: string): string | undefined {
  return cache.get(id);
}

// Fetch (or return cached) breakdown for a story. Returns null on failure so the
// caller can show its retry UI.
export function fetchBreakdown(item: Pick<NewsItem, "id" | "title" | "summary">): Promise<string | null> {
  const cached = cache.get(item.id);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(item.id);
  if (existing) return existing;

  const req = (async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, summary: item.summary }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const explanation: string | undefined = data.explanation;
      if (!explanation) return null;
      cache.set(item.id, explanation);
      return explanation;
    } catch {
      return null;
    } finally {
      inflight.delete(item.id);
    }
  })();

  inflight.set(item.id, req);
  return req;
}

// Fire-and-forget warmup used while scrolling. Skips anything already cached or
// in flight so it never duplicates work.
export function prefetchBreakdown(item: Pick<NewsItem, "id" | "title" | "summary">): void {
  if (cache.has(item.id) || inflight.has(item.id)) return;
  void fetchBreakdown(item);
}
