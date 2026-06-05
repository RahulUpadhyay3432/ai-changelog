import { createClient } from "@supabase/supabase-js";
import type { NewsItem } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbNewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category_slug: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

function dbToNewsItem(row: DbNewsItem): NewsItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    categorySlug: row.category_slug as NewsItem["categorySlug"],
    imageUrl: row.image_url ?? undefined,
    publishedAt: row.published_at,
  };
}

// ── "All" feed ranking ───────────────────────────────────────────────────────
// Score = recencyScore (0–48, dominant) + categoryBonus (0–6, gentle tilt).
// Recency dominates so genuinely new news always surfaces regardless of
// category; the bonus only decides ties between equally-fresh items. A second
// de-clustering pass then caps consecutive same-category cards so the top is a
// mix, not a wall of one category.
//
// NOTE: these bonuses are a heuristic for "what most readers want". Once enough
// read/save events accumulate, replace them with real engagement weights.
const CATEGORY_BONUS: Record<string, number> = {
  "ai-models":      6,
  "startups":       5,
  "big-tech":       4,
  "dev-tools":      3,
  "research":       2,
  "infrastructure": 1,
  "policy":         1,
  "funding-ma":     1,
  "open-source":    1,
};

const RECENCY_WINDOW_H = 48; // matches the feed's 48h cutoff
const MAX_CONSECUTIVE = 2;   // no more than N same-category cards in a row

function rankScore(item: NewsItem): number {
  const ageHours = (Date.now() - new Date(item.publishedAt).getTime()) / 3_600_000;
  const recency = Math.max(0, RECENCY_WINDOW_H - ageHours);
  const bonus = CATEGORY_BONUS[item.categorySlug] ?? 2;
  return recency + bonus;
}

// Greedy re-rank: keep items in score order, but whenever placing the next item
// would exceed MAX_CONSECUTIVE of the same category, pull up the highest-scoring
// item of a different category instead. Falls back to score order when no other
// category is available.
function deClusterByCategory(sorted: NewsItem[]): NewsItem[] {
  const pending = [...sorted];
  const result: NewsItem[] = [];

  while (pending.length > 0) {
    let pickIdx = 0;

    if (result.length >= MAX_CONSECUTIVE) {
      const lastCat = result[result.length - 1].categorySlug;
      const runIsMaxed = result
        .slice(-MAX_CONSECUTIVE)
        .every((x) => x.categorySlug === lastCat);
      if (runIsMaxed) {
        const alt = pending.findIndex((x) => x.categorySlug !== lastCat);
        if (alt !== -1) pickIdx = alt;
      }
    }

    result.push(pending.splice(pickIdx, 1)[0]);
  }

  return result;
}

export async function fetchNewsItemById(id: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from("news_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return dbToNewsItem(data as DbNewsItem);
}

export async function fetchNewsItems(categorySlug?: string): Promise<NewsItem[]> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("news_items")
    .select("*")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(100);

  if (categorySlug && categorySlug !== "all") {
    query = query.eq("category_slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data as DbNewsItem[]).map(dbToNewsItem);

  if (!categorySlug || categorySlug === "all") {
    // Recency-dominant score (fresh news always reaches the top), then break up
    // same-category runs so the feed reads as a mix instead of one big block.
    items.sort((a, b) => rankScore(b) - rankScore(a));
    return deClusterByCategory(items);
  }

  return items;
}
