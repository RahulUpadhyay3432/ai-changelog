// Server-side data access for the knowledge base (entities, explainers, the
// durable story archive, digests). Read-only, anon client — RLS only exposes
// active entities and published explainers/digests, so these helpers are safe
// to call from public (web) pages and the sitemap.

import { createClient } from "@supabase/supabase-js";
import { isGenericEntityName, type EntityType } from "./entities";
import { CURATED_ESSENTIALS } from "./radar-essentials";
import { MCP_CATEGORY_ORDER, type McpServer, type McpCategory } from "./radar-mcp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export interface Entity {
  id: string;
  slug: string;
  canonicalName: string;
  entityType: EntityType;
  shortDesc: string | null;
  mentionCount: number;
  lastMentionedAt: string | null;
  isSeed: boolean;
}

export interface Explainer {
  definition: string | null;
  whyItMatters: string | null;
  howItWorks: string | null;
  currentDevelopments: string | null;
  relatedSlugs: string[];
  citationStoryIds: string[];
  qualityScore: number | null;
  updatedAt: string;
}

export interface ArchivedStory {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  categorySlug: string;
  imageUrl: string | null;
  publishedAt: string;
}

interface EntityRow {
  id: string;
  slug: string;
  canonical_name: string;
  entity_type: string;
  short_desc: string | null;
  mention_count: number;
  last_mentioned_at: string | null;
  is_seed: boolean;
}

interface StoryRow {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category_slug: string;
  image_url: string | null;
  published_at: string;
}

function toEntity(row: EntityRow): Entity {
  return {
    id: row.id,
    slug: row.slug,
    canonicalName: row.canonical_name,
    entityType: row.entity_type as EntityType,
    shortDesc: row.short_desc,
    mentionCount: row.mention_count,
    lastMentionedAt: row.last_mentioned_at,
    isSeed: row.is_seed,
  };
}

function toStory(row: StoryRow): ArchivedStory {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    categorySlug: row.category_slug,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
  };
}

const ENTITY_COLS =
  "id, slug, canonical_name, entity_type, short_desc, mention_count, last_mentioned_at, is_seed";
// Literal (not ENTITY_COLS + "...") so PostgREST infers the row type — a widened
// string makes .select() return GenericStringError and breaks the cast.
const RADAR_ENTITY_COLS =
  "id, slug, canonical_name, entity_type, short_desc, mention_count, last_mentioned_at, is_seed, first_seen_at, value_line, value_line_story_id, value_line_at";
const STORY_COLS =
  "id, title, summary, source_url, source_name, category_slug, image_url, published_at";

export async function getEntityBySlug(slug: string): Promise<Entity | null> {
  const { data } = await supabase
    .from("entities")
    .select(ENTITY_COLS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return data ? toEntity(data as EntityRow) : null;
}

export async function getPublishedExplainer(entityId: string): Promise<Explainer | null> {
  const { data } = await supabase
    .from("entity_explainers")
    .select(
      "definition, why_it_matters, how_it_works, current_developments, related_slugs, citation_story_ids, quality_score, updated_at"
    )
    .eq("entity_id", entityId)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  const row = data as {
    definition: string | null;
    why_it_matters: string | null;
    how_it_works: string | null;
    current_developments: string | null;
    related_slugs: string[] | null;
    citation_story_ids: string[] | null;
    quality_score: number | null;
    updated_at: string;
  };
  return {
    definition: row.definition,
    whyItMatters: row.why_it_matters,
    howItWorks: row.how_it_works,
    currentDevelopments: row.current_developments,
    relatedSlugs: row.related_slugs ?? [],
    citationStoryIds: row.citation_story_ids ?? [],
    qualityScore: row.quality_score,
    updatedAt: row.updated_at,
  };
}

// Stories that mention an entity, newest first. Reads the durable archive so it
// keeps working after news_items rotates.
export async function getStoriesForEntity(entityId: string, limit = 8): Promise<ArchivedStory[]> {
  const { data: mentions } = await supabase
    .from("entity_mentions")
    .select("story_id")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false }) // most-recent links, not arbitrary 60
    .limit(60);
  const ids = (mentions ?? []).map((m) => (m as { story_id: string }).story_id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("story_archive")
    .select(STORY_COLS)
    .in("id", ids)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => toStory(r as StoryRow));
}

export async function getStoriesByIds(ids: string[]): Promise<ArchivedStory[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("story_archive")
    .select(STORY_COLS)
    .in("id", ids)
    .order("published_at", { ascending: false });
  return (data ?? []).map((r) => toStory(r as StoryRow));
}

export async function getArchivedStoryById(id: string): Promise<ArchivedStory | null> {
  const { data } = await supabase
    .from("story_archive")
    .select(STORY_COLS)
    .eq("id", id)
    .maybeSingle();
  return data ? toStory(data as StoryRow) : null;
}

// Related entities by slug — for the "Related" chips. Only active ones resolve,
// so dead/hidden slugs silently drop.
export async function getEntitiesBySlugs(slugs: string[]): Promise<Entity[]> {
  if (slugs.length === 0) return [];
  const { data } = await supabase
    .from("entities")
    .select(ENTITY_COLS)
    .in("slug", slugs)
    .eq("status", "active");
  return (data ?? []).map((r) => toEntity(r as EntityRow));
}

// Concept/technique entities for the /explore hub and /learn listing, most-
// mentioned first. Seeds always surface (they're the curated foundation).
export async function getLearnEntities(limit = 60): Promise<Entity[]> {
  const { data } = await supabase
    .from("entities")
    .select(ENTITY_COLS)
    .in("entity_type", ["technique", "concept"])
    .eq("status", "active")
    .order("is_seed", { ascending: false })
    .order("mention_count", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => toEntity(r as EntityRow));
}

// ─── Radar ───────────────────────────────────────────────────────────────────

export interface RadarItem {
  entity: Entity;
  latestStory: ArchivedStory | null;
  isNew: boolean; // first_seen_at within last 7 days
  valueLine: string | null; // generated "what this lets you do" line (null = held / ungenerated)
  valueLineStoryId: string | null; // story the line was generated from
  valueLineAt: string | null; // when last evaluated (null = never tried)
}

// Value-filtering funnel for the Radar tab: model/tool/company entities that
// are recent (mentioned within recencyDays), credible (≥ minMentions), and
// ranked by freshness + traction. Returns items with their most recent archived
// story so the caller can use the summary as a value-line without a new LLM call.
export async function getRadarFeed(
  recencyDays = 14,
  minMentions = 2,
  limit = 40
): Promise<RadarItem[]> {
  const cutoff = new Date(Date.now() - recencyDays * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: entityRows } = await supabase
    .from("entities")
    .select(RADAR_ENTITY_COLS)
    .in("entity_type", ["model", "tool", "company"])
    .eq("status", "active")
    .gte("last_mentioned_at", cutoff)
    .gte("mention_count", minMentions)
    .order("last_mentioned_at", { ascending: false })
    .order("mention_count", { ascending: false })
    .limit(limit);

  if (!entityRows || entityRows.length === 0) return [];

  // Drop generic junk ("LLM", "AI tool") that's already sitting in the DB —
  // the canonicalize denylist stops new ones, this cleans existing rows.
  const entityData = entityRows
    .map((r) => {
      const row = r as EntityRow & {
        first_seen_at: string | null;
        value_line: string | null;
        value_line_story_id: string | null;
        value_line_at: string | null;
      };
      return {
        entity: toEntity(row),
        firstSeenAt: row.first_seen_at ?? "",
        valueLine: row.value_line,
        valueLineStoryId: row.value_line_story_id,
        valueLineAt: row.value_line_at,
      };
    })
    .filter(({ entity }) => !isGenericEntityName(entity.canonicalName));

  if (entityData.length === 0) return [];
  const entityIds = entityData.map((e) => e.entity.id);

  // Pull recent mentions per entity (already newest-first). Keep up to 10 story
  // candidates each so we can pick the one that's actually ABOUT the entity.
  const { data: mentionRows } = await supabase
    .from("entity_mentions")
    .select("entity_id, story_id, created_at")
    .in("entity_id", entityIds)
    .order("created_at", { ascending: false })
    .limit(entityIds.length * 10);

  const storyIdsByEntity = new Map<string, string[]>();
  for (const m of mentionRows ?? []) {
    const row = m as { entity_id: string; story_id: string };
    const list = storyIdsByEntity.get(row.entity_id) ?? [];
    if (list.length < 10) list.push(row.story_id);
    storyIdsByEntity.set(row.entity_id, list);
  }

  const allStoryIds = [...new Set([...storyIdsByEntity.values()].flat())];
  const storiesById = new Map<string, ArchivedStory>();
  if (allStoryIds.length > 0) {
    const { data: storyRows } = await supabase
      .from("story_archive")
      .select(STORY_COLS)
      .in("id", allStoryIds);
    for (const s of (storyRows ?? []).map((r) => toStory(r as StoryRow))) {
      storiesById.set(s.id, s);
    }
  }

  // Value-line story: prefer the most recent story whose HEADLINE names the
  // entity (it's genuinely about it) — fall back to the most recent mention.
  const pickStory = (entity: Entity): ArchivedStory | null => {
    const stories = (storyIdsByEntity.get(entity.id) ?? [])
      .map((id) => storiesById.get(id))
      .filter((s): s is ArchivedStory => !!s);
    if (stories.length === 0) return null;
    return stories.find((s) => titleNamesEntity(s.title, entity.canonicalName)) ?? stories[0];
  };

  return entityData.map(({ entity, firstSeenAt, valueLine, valueLineStoryId, valueLineAt }) => ({
    entity,
    latestStory: pickStory(entity),
    isNew: !!firstSeenAt && firstSeenAt >= sevenDaysAgo,
    valueLine,
    valueLineStoryId,
    valueLineAt,
  }));
}

// Entities that are extracted but aren't really AI/tech subjects — they get a
// generated value-line but read as off-topic on the radar. Dropped at read time.
const RADAR_ENTITY_DENYLIST = new Set<string>([
  "spacex", "tesla", "amazon", "facebook", "whatsapp", "instagram", "walmart",
  "netflix", "disney", "uber", "starlink",
]);

// Radar cards for the UI: only entities with a generated, grounded value line
// (held-back / ungenerated entities don't ship a card), minus off-topic names.
// Over-fetches then filters, so the caller still gets up to `limit` grounded cards.
export async function getRadarCards(recencyDays = 21, minMentions = 2, limit = 40): Promise<RadarItem[]> {
  const all = await getRadarFeed(recencyDays, minMentions, Math.max(limit * 2, 60));
  return all
    .filter((it) => !!it.valueLine && it.valueLine.trim().length > 0)
    .filter((it) => !RADAR_ENTITY_DENYLIST.has(it.entity.canonicalName.trim().toLowerCase()))
    .slice(0, limit);
}

// ─── Radar tools (GitHub trending + Product Hunt) ────────────────────────────
// Structured tool sources whose value-line is the maker's own description — the
// trustworthy half of "Discover" (no LLM, no drift). Populated by /api/radar/tools.

export interface RadarTool {
  source: "github" | "producthunt" | "curated";
  name: string;
  valueLine: string;
  url: string;
  meta: string | null;
  score: number;
  topics: string[];
  lastSeenAt: string;
  description: string | null; // longer body (e.g. the full Product Hunt description)
  imageUrl: string | null; // product thumbnail (Product Hunt) — used as the logo
}

interface RadarToolRow {
  source: string;
  name: string;
  value_line: string;
  url: string;
  meta: string | null;
  score: number;
  topics: string[] | null;
  last_seen_at: string;
  description?: string | null;
  image_url?: string | null;
}

function toRadarTool(r: unknown): RadarTool {
  const row = r as RadarToolRow;
  return {
    source: row.source as RadarTool["source"],
    name: row.name,
    valueLine: row.value_line,
    url: row.url,
    meta: row.meta,
    score: row.score,
    topics: row.topics ?? [],
    lastSeenAt: row.last_seen_at,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
  };
}

const RADAR_TOOL_COLS = "source, name, value_line, url, meta, score, topics, last_seen_at";
// `description` (0006) + `image_url` (0007) — request them, but degrade
// gracefully so a deploy that lands before a migration still returns tools.
const RADAR_TOOL_COLS_DESC = "source, name, value_line, url, meta, score, topics, last_seen_at, description, image_url";

function columnMissing(message: string | undefined): boolean {
  return !!message && /(description|image_url)/i.test(message);
}

// "What's new" — GitHub created-last-48h + Product Hunt, freshest/most-traction first.
export async function getRadarTools(limit = 30): Promise<RadarTool[]> {
  const run = (cols: string) =>
    supabase
      .from("radar_tools")
      .select(cols)
      .eq("kind", "trending")
      .order("last_seen_at", { ascending: false })
      .order("score", { ascending: false })
      .limit(limit);
  const first = await run(RADAR_TOOL_COLS_DESC);
  const { data } = columnMissing(first.error?.message) ? await run(RADAR_TOOL_COLS) : first;
  return (data ?? []).map(toRadarTool);
}

// ── MCP servers (curated featured + registry-discovered) ─────────────────────
export interface RadarMcp {
  servers: McpServer[];
  meta: Record<string, { stars: number; createdAt: string }>;
}

interface RadarMcpRow {
  name: string;
  tagline: string;
  description: string | null;
  category: string;
  url: string;
  by: string;
  score: number;
  gh_created_at: string | null;
}

const VALID_MCP_CATEGORIES = new Set<string>(MCP_CATEGORY_ORDER);

// Reads radar_mcp (populated by /api/radar/mcp). Returns empty when the table is
// missing/empty so the page falls back to the static curated list (never blank).
export async function getRadarMcpServers(): Promise<RadarMcp> {
  const { data, error } = await supabase
    .from("radar_mcp")
    .select("name, tagline, description, category, url, by, score, gh_created_at, kind, sort_rank")
    .order("kind", { ascending: false }) // 'featured' before 'discovered'
    .order("sort_rank", { ascending: true })
    .order("score", { ascending: false });
  if (error || !data) return { servers: [], meta: {} };

  const servers: McpServer[] = [];
  const meta: Record<string, { stars: number; createdAt: string }> = {};
  for (const r of data as RadarMcpRow[]) {
    const category = (VALID_MCP_CATEGORIES.has(r.category) ? r.category : "Dev tools") as McpCategory;
    servers.push({
      name: r.name,
      tagline: r.tagline,
      description: r.description ?? "",
      category,
      url: r.url,
      by: r.by === "official" ? "official" : "community",
    });
    meta[r.url] = { stars: r.score ?? 0, createdAt: r.gh_created_at ?? "" };
  }
  return { servers, meta };
}

// "Essentials" — the evergreen canon (curated closed tools + most-starred OSS),
// accessible-first (sort_rank), then by traction.
//
// The curated half is static editorial (CURATED_ESSENTIALS) that only reaches
// the DB after the tools cron runs. So we ALWAYS merge the static list in: the
// Builder category sections + Browse render richly regardless of DB state, and
// the DB still layers canon OSS (and any DB copy of the curated rows) on top.
export async function getRadarEssentials(limit = 40): Promise<RadarTool[]> {
  const run = (cols: string) =>
    supabase
      .from("radar_tools")
      .select(cols)
      .eq("kind", "essential")
      .order("sort_rank", { ascending: true })
      .order("score", { ascending: false })
      .limit(limit);
  const first = await run(RADAR_TOOL_COLS_DESC);
  const { data } = columnMissing(first.error?.message) ? await run(RADAR_TOOL_COLS) : first;
  const fromDb = (data ?? []).map(toRadarTool);

  // De-dupe by url: static curated wins for its own rows; DB supplies the rest
  // (canon OSS, plus curated rows if the cron has run). Static comes first so
  // the accessible-first editorial ordering is preserved.
  const seen = new Set<string>();
  const merged: RadarTool[] = [];
  for (const t of [...STATIC_ESSENTIALS, ...fromDb]) {
    const key = t.url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(t);
  }
  return merged;
}

// The curated essentials as RadarTool rows, sourced from the static editorial
// list (no DB round-trip). meta = category bucket, mirroring the cron's mapping.
const STATIC_ESSENTIALS: RadarTool[] = CURATED_ESSENTIALS.map((t) => ({
  source: "curated",
  name: t.name,
  valueLine: t.valueLine,
  url: t.url,
  meta: t.category,
  score: 0,
  topics: [],
  lastSeenAt: "",
  description: t.description ?? null,
  imageUrl: null,
}));

// Whole-word, case-insensitive check that a story headline names an entity —
// boundaries so "Meta" doesn't match "metadata" and "AI" doesn't match "train".
function titleNamesEntity(title: string, name: string): boolean {
  if (!title || !name) return false;
  const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(title.toLowerCase());
}
