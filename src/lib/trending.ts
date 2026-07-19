// Server-side "what's actually trending" ranking for the Trending tab.
//
// The home feed is pure recency. Trending is the *signal layer*: it ranks live
// stories by how much the whole corpus is talking about their subjects
// (entity coverage = how many sources cover an entity) × recency decay, then
// dedupes so the Top 3 are distinct topics — not three angles on one event.
//
// This is a ₹0 heuristic that reuses the entity graph ingestion already builds.
// Upgrade seam: once a Gemini billing cap is set, a daily editor pass can replace
// the heuristic with LLM-picked Top 3 + a one-line "why it leads today."

import { createClient } from "@supabase/supabase-js";
import type { NewsItem } from "./types";
import { scoreStoriesByCoverage } from "./coverage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export interface TrendingStory extends NewsItem {
  heat: number; // composite score (higher = more trending)
  topEntity: string | null; // the lead subject, used for topic dedup + a "why" hint
  sources: number; // coverage of the lead subject (entity mention_count)
}

interface LiveRow {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category_slug: string;
  image_url: string | null;
  published_at: string;
}

function toNewsItem(r: LiveRow): NewsItem {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    sourceUrl: r.source_url,
    sourceName: r.source_name,
    categorySlug: r.category_slug as NewsItem["categorySlug"],
    imageUrl: r.image_url ?? undefined,
    publishedAt: r.published_at,
  };
}

export interface TrendingResult {
  top: TrendingStory[];
  rest: TrendingStory[];
}

// Ranks the last `windowHours` of news. `topCount` distinct-topic highlights up
// top, the next `restCount` as the trending list. Degrades to recency when the
// entity graph is thin (every heat collapses to its recency term).
export async function getTrending(
  windowHours = 36,
  topCount = 3,
  restCount = 18
): Promise<TrendingResult> {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const { data: items } = await supabase
    .from("news_items")
    .select("id, title, summary, source_url, source_name, category_slug, image_url, published_at")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(120);

  const live = (items ?? []) as LiveRow[];
  if (live.length === 0) return { top: [], rest: [] };

  // Coverage score (subject prominence × recency) per story — the join now lives
  // in coverage.ts, shared with the home-feed opener so there's one copy of it.
  const scores = await scoreStoriesByCoverage(supabase, live);
  const scored: TrendingStory[] = live
    .map((r) => {
      const s = scores.get(r.id) ?? { heat: 0, topEntity: null, sources: 0 };
      return { ...toNewsItem(r), heat: s.heat, topEntity: s.topEntity, sources: s.sources };
    })
    .sort((a, b) => b.heat - a.heat);

  // Top N, deduped by lead topic so the highlights aren't three takes on one story.
  const top: TrendingStory[] = [];
  const seen = new Set<string>();
  for (const s of scored) {
    if (top.length >= topCount) break;
    const key = (s.topEntity ?? s.id).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    top.push(s);
  }

  const topIds = new Set(top.map((s) => s.id));
  const rest = scored.filter((s) => !topIds.has(s.id)).slice(0, restCount);

  return { top, rest };
}
