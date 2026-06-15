// Server-side data access for the knowledge base (entities, explainers, the
// durable story archive, digests). Read-only, anon client — RLS only exposes
// active entities and published explainers/digests, so these helpers are safe
// to call from public (web) pages and the sitemap.

import { createClient } from "@supabase/supabase-js";
import type { EntityType } from "./entities";

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
