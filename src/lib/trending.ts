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

  // story_archive is a durable mirror with its OWN id (keyed/deduped on
  // source_url); entity mentions are linked to that archive id. So join live
  // stories → archive by source_url, then archive id → entity_mentions.
  const urls = live.map((r) => r.source_url);
  const { data: archRows } = await supabase
    .from("story_archive")
    .select("id, source_url")
    .in("source_url", urls);

  const archIdByUrl = new Map<string, string>();
  for (const a of (archRows ?? []) as { id: string; source_url: string }[]) {
    archIdByUrl.set(a.source_url, a.id);
  }
  // archive id for a live row (its own id is a safe, unique fallback so unmatched
  // stories simply carry no entities rather than colliding).
  const archIdForLive = (r: LiveRow): string => archIdByUrl.get(r.source_url) ?? r.id;

  const archIds = [...new Set([...archIdByUrl.values()])];
  if (archIds.length === 0) archIds.push("00000000-0000-0000-0000-000000000000");

  const { data: mentionRows } = await supabase
    .from("entity_mentions")
    .select("entity_id, story_id")
    .in("story_id", archIds);

  const mentions = (mentionRows ?? []) as { entity_id: string; story_id: string }[];
  const entityIds = [...new Set(mentions.map((m) => m.entity_id))];

  const entById = new Map<string, { name: string; count: number }>();
  if (entityIds.length > 0) {
    const { data: entRows } = await supabase
      .from("entities")
      .select("id, canonical_name, mention_count")
      .in("id", entityIds)
      .eq("status", "active");
    for (const e of (entRows ?? []) as { id: string; canonical_name: string; mention_count: number }[]) {
      entById.set(e.id, { name: e.canonical_name, count: e.mention_count });
    }
  }

  // Lead entity (highest coverage) per archive story.
  const leadByStory = new Map<string, { name: string; count: number }>();
  for (const m of mentions) {
    const e = entById.get(m.entity_id);
    if (!e) continue;
    const cur = leadByStory.get(m.story_id);
    if (!cur || e.count > cur.count) leadByStory.set(m.story_id, e);
  }

  const now = Date.now();
  const scored: TrendingStory[] = live
    .map((r) => {
      const lead = leadByStory.get(archIdForLive(r));
      const ageHours = (now - new Date(r.published_at).getTime()) / (60 * 60 * 1000);
      const recency = Math.exp(-ageHours / 24); // ~1-day half-life
      const sources = lead?.count ?? 0;
      const heat = (1 + sources) * recency;
      return { ...toNewsItem(r), heat, topEntity: lead?.name ?? null, sources };
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
