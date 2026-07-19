// ── Coverage scoring ─────────────────────────────────────────────────────────
// Shared importance signal for the Trending tab AND the home-feed opener.
// "Coverage" = how prominent a story's lead subject is across the whole corpus
// (the entity graph's mention_count) × recency decay. The graph is built at
// ingest; this is a ₹0 heuristic that reads it.
//
// Fetch-free re: news_items — the caller passes the rows it already fetched, so
// the feed (100) and trending (120) share ONE copy of the archive→mentions→
// entities join instead of each re-querying news_items.
//
// NOTE: entities.mention_count is a GLOBAL cumulative counter (subject
// prominence, not this-story co-mentions), so callers must temper it with a
// freshness gate before letting a high score lead.

import type { SupabaseClient } from "@supabase/supabase-js";

export interface CoverageScore {
  heat: number; // (1 + sources) * recency — higher = more important right now
  topEntity: string | null; // lead subject, for topic dedupe + a "why" hint
  sources: number; // lead subject's global mention_count (0 if unlinked)
}

type ScoreRow = { id: string; source_url: string; published_at: string };

// PostgREST serializes .in() values into the GET URL, which overflows (→ 414,
// then a SILENT null) once you pass ~75+ long values like source_urls — which
// zeroed out the score for the whole feed. Chunk the values (small, since some
// source_urls are long) and run the chunks in parallel so there's no latency hit.
const IN_CHUNK = 20;
async function inChunks<Row>(
  values: string[],
  run: (chunk: string[]) => PromiseLike<{ data: Row[] | null }>
): Promise<Row[]> {
  if (values.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < values.length; i += IN_CHUNK) chunks.push(values.slice(i, i + IN_CHUNK));
  const results = await Promise.all(chunks.map((c) => run(c)));
  return results.flatMap((r) => r.data ?? []);
}

// Returns a CoverageScore for EVERY input row. Rows with no linked entity (or a
// sparse/empty graph) get { heat: recency, topEntity: null, sources: 0 } — so an
// empty graph degrades the caller to pure recency automatically.
export async function scoreStoriesByCoverage(
  client: SupabaseClient,
  rows: ScoreRow[],
  opts?: { recencyTauHours?: number; now?: number }
): Promise<Map<string, CoverageScore>> {
  const tau = opts?.recencyTauHours ?? 24;
  const now = opts?.now ?? Date.now();
  const result = new Map<string, CoverageScore>();
  if (rows.length === 0) return result;

  // story_archive is a durable mirror with its OWN id (keyed/deduped on
  // source_url); entity mentions link to that archive id. So map live rows →
  // archive id by source_url, then archive id → entity_mentions.
  const urls = rows.map((r) => r.source_url);
  const archRows = await inChunks<{ id: string; source_url: string }>(urls, (chunk) =>
    client.from("story_archive").select("id, source_url").in("source_url", chunk)
  );

  const archIdByUrl = new Map<string, string>();
  for (const a of archRows) archIdByUrl.set(a.source_url, a.id);
  // A live row's own id is a safe, unique fallback so unmatched stories simply
  // carry no entities rather than colliding on the mention join.
  const archIdForRow = (r: ScoreRow): string => archIdByUrl.get(r.source_url) ?? r.id;

  const archIds = [...new Set([...archIdByUrl.values()])];
  const mentions = await inChunks<{ entity_id: string; story_id: string }>(archIds, (chunk) =>
    client.from("entity_mentions").select("entity_id, story_id").in("story_id", chunk)
  );

  const entityIds = [...new Set(mentions.map((m) => m.entity_id))];
  const entRows = await inChunks<{ id: string; canonical_name: string; mention_count: number }>(
    entityIds,
    (chunk) =>
      client.from("entities").select("id, canonical_name, mention_count").in("id", chunk).eq("status", "active")
  );
  const entById = new Map<string, { name: string; count: number }>();
  for (const e of entRows) entById.set(e.id, { name: e.canonical_name, count: e.mention_count });

  // Lead entity (highest coverage) per archive story.
  const leadByStory = new Map<string, { name: string; count: number }>();
  for (const m of mentions) {
    const e = entById.get(m.entity_id);
    if (!e) continue;
    const cur = leadByStory.get(m.story_id);
    if (!cur || e.count > cur.count) leadByStory.set(m.story_id, e);
  }

  for (const r of rows) {
    const lead = leadByStory.get(archIdForRow(r));
    const ageHours = (now - new Date(r.published_at).getTime()) / (60 * 60 * 1000);
    const recency = Math.exp(-ageHours / tau); // ~1-day half-life at tau=24
    const sources = lead?.count ?? 0;
    result.set(r.id, {
      heat: (1 + sources) * recency,
      topEntity: lead?.name ?? null,
      sources,
    });
  }

  return result;
}
