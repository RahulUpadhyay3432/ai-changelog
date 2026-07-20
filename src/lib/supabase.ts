import { createClient } from "@supabase/supabase-js";
import type { NewsItem } from "./types";
import { getFeedPrefs } from "./storage";
import { CATEGORIES } from "./categories";
import { feedCutoffISO } from "./feed-window";
import { scoreStoriesByCoverage, type CoverageScore } from "./coverage";

const ALL_SLUGS = CATEGORIES.map((c) => c.slug);

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
// Pure recency: newest items first, no category weighting at all. A light
// de-clustering pass then caps consecutive same-category cards so a high-volume
// category (e.g. AI) can't form a solid wall at the top — but order otherwise
// follows publish time exactly.
const MAX_CONSECUTIVE = 2;  // no more than N same-category cards in a row
const MAX_PER_SOURCE = 3;   // no source dominates the feed

// ── Opener tuning ────────────────────────────────────────────────────────────
// Lead the "all" feed with the most important recent stories, then revert to
// chronological. Importance = lead-subject coverage × recency (see coverage.ts).
// The freshness gate is load-bearing: mention_count is a GLOBAL prominence
// counter, so without it an old-but-prominent story could lead.
const OPENER_SIZE = 1;              // pin only the single most-relevant recent story on top, then pure recency (keeps the feed feeling chronological)
const OPENER_FRESHNESS_HOURS = 72;  // max age eligible to lead (stale-story guard)
const OPENER_MAX_PER_SOURCE = 1;    // no single outlet dominates the lead
const RECENCY_TAU_HOURS = 24;       // decay constant (matches trending's default)

function rankScore(item: NewsItem): number {
  // Newest first — strictly by publish time.
  return new Date(item.publishedAt).getTime();
}

// Hard cap: keep only the most recent MAX_PER_SOURCE items from each source.
// Runs before de-clustering so the input to deClusterByCategory is already diverse.
function capBySource(sorted: NewsItem[]): NewsItem[] {
  const counts: Record<string, number> = {};
  return sorted.filter((item) => {
    const n = counts[item.sourceName] ?? 0;
    if (n >= MAX_PER_SOURCE) return false;
    counts[item.sourceName] = n + 1;
    return true;
  });
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

// The "all" feed leads with the most important recent stories (coverage × recency,
// see coverage.ts), then reverts to strict recency. Fixes the "weak opener" leak:
// a first-time user's first cards are the stories that matter, not just the newest.
// Degrades to the plain recency feed when the entity graph is sparse or a read fails.
async function composeAllFeed(items: NewsItem[], rankOpener: boolean): Promise<NewsItem[]> {
  const recencySorted = [...items].sort((a, b) => rankScore(b) - rankScore(a));

  // A/B control arm: the pre-opener behaviour (pure recency + source cap +
  // de-cluster), so a PostHog flag can measure the opener's effect on activation.
  if (!rankOpener) return deClusterByCategory(capBySource(recencySorted));

  let scores: Map<string, CoverageScore>;
  try {
    scores = await scoreStoriesByCoverage(
      supabase,
      recencySorted.map((it) => ({ id: it.id, source_url: it.sourceUrl, published_at: it.publishedAt })),
      { recencyTauHours: RECENCY_TAU_HOURS }
    );
  } catch {
    scores = new Map();
  }

  // Opener: fresh + genuinely covered stories, ranked by heat, one per topic and
  // capped per source. Empty when there's no signal ⇒ feed == today's recency feed.
  const now = Date.now();
  const opener: NewsItem[] = [];
  const openerIds = new Set<string>();
  const seenTopic = new Set<string>();
  const perSource: Record<string, number> = {};
  const candidates = recencySorted
    .filter((it) => now - new Date(it.publishedAt).getTime() <= OPENER_FRESHNESS_HOURS * 3_600_000)
    .filter((it) => (scores.get(it.id)?.sources ?? 0) > 0)
    .sort((a, b) => (scores.get(b.id)?.heat ?? 0) - (scores.get(a.id)?.heat ?? 0));
  for (const it of candidates) {
    if (opener.length >= OPENER_SIZE) break;
    const topic = (scores.get(it.id)?.topEntity ?? it.id).toLowerCase();
    if (seenTopic.has(topic)) continue;
    if ((perSource[it.sourceName] ?? 0) >= OPENER_MAX_PER_SOURCE) continue;
    seenTopic.add(topic);
    perSource[it.sourceName] = (perSource[it.sourceName] ?? 0) + 1;
    opener.push(it);
    openerIds.add(it.id);
  }

  // Body: everything else, strict recency, then the existing source cap + category
  // de-cluster so no outlet/topic walls up. Breaking news (no coverage yet) lands
  // at the top of the body, directly under the opener.
  const body = deClusterByCategory(capBySource(recencySorted.filter((it) => !openerIds.has(it.id))));
  return [...opener, ...body];
}

export async function fetchNewsItemById(id: string): Promise<NewsItem | null> {
  const { data } = await supabase
    .from("news_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (data) return dbToNewsItem(data as DbNewsItem);

  // Fallback to the durable archive: news_items rotates after the feed window
  // (feed-window.ts), but /story/[id] links must keep resolving forever.
  const { data: archived } = await supabase
    .from("story_archive")
    .select("id, title, summary, source_url, source_name, category_slug, image_url, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!archived) return null;
  return dbToNewsItem({ ...(archived as Omit<DbNewsItem, "created_at">), created_at: "" } as DbNewsItem);
}

export async function fetchNewsItems(
  categorySlug?: string,
  opts?: { rankOpener?: boolean }
): Promise<NewsItem[]> {
  const cutoff = feedCutoffISO();

  let query = supabase
    .from("news_items")
    .select("*")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(100);

  if (categorySlug && categorySlug !== "all") {
    query = query.eq("category_slug", categorySlug);
  } else {
    // Apply user's feed preferences — only filter when they've selected specific topics
    // null or empty = no preference = show everything
    const prefs = getFeedPrefs();
    if (prefs !== null && prefs.length > 0 && prefs.length < ALL_SLUGS.length) {
      query = query.in("category_slug", prefs);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data as DbNewsItem[]).map(dbToNewsItem);

  if (!categorySlug || categorySlug === "all") {
    return composeAllFeed(items, opts?.rankOpener ?? true);
  }

  return items;
}
