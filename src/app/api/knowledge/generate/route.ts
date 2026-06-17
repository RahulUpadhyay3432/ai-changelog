import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { callLLM } from "@/lib/llm";
import {
  buildExplainerPrompt,
  parseExplainer,
  buildCritiquePrompt,
  parseCritique,
  type ParsedExplainer,
} from "@/lib/knowledge-prompt";
import { isBadExplainerSection } from "@/lib/quality";
import { canonicalize } from "@/lib/entities";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { revalidatePath } from "next/cache";

// Batch generation needs headroom: ~2 LLM calls/entity at ~7s each, bounded
// concurrency. 300s is the Vercel ceiling; the prioritised batch self-drains
// across daily runs if the backlog is larger than one run can clear.
export const runtime = "nodejs";
export const maxDuration = 300;

// Publish threshold (self-critique score). 50-69 is held for review; <50 retries
// once then holds. Seeds bypass the source-count gate (foundational, low risk).
const PUBLISH_SCORE = 70;
const HOLD_SCORE = 50;
const DEFAULT_BATCH = 40;
const GEN_CONCURRENCY = 4;
const MIN_SOURCES = 2;
const MAX_CONTEXT_STORIES = 8;

// Writer client — REQUIRES the service role key. Falling back to the anon key
// would silently fail every write under RLS while still burning LLM calls, so
// the GET handler hard-fails when the key is absent rather than fall back.
function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface EntityRow {
  id: string;
  slug: string;
  canonical_name: string;
  entity_type: string;
  is_seed: boolean;
  mention_count: number;
  last_mentioned_at: string | null;
}

interface ContextStory {
  id: string;
  title: string;
  summary: string;
}

type GenResults = {
  considered: number;
  published: number;
  held: number;
  skipped: number;
  errors: string[];
};

// ── Selection: entities that need a (re)generated explainer ─────────────────
// Eligible = active AND (seed OR enough sources). Needs work = no explainer yet,
// or new stories arrived since the explainer was last written (stale).
async function selectEntities(admin: SupabaseClient, batch: number, slug: string | null): Promise<EntityRow[]> {
  let query = admin
    .from("entities")
    .select("id, slug, canonical_name, entity_type, is_seed, mention_count, last_mentioned_at")
    .eq("status", "active")
    // M1 ships /learn only — generate concept/technique explainers; M2 widens
    // this to models/tools/companies when /tools ships.
    .in("entity_type", ["technique", "concept"]);

  if (slug) {
    query = query.eq("slug", slug);
  } else {
    query = query
      .or(`is_seed.eq.true,mention_count.gte.${MIN_SOURCES}`)
      .order("is_seed", { ascending: false })
      .order("mention_count", { ascending: false })
      .order("last_mentioned_at", { ascending: false })
      .limit(batch * 3);
  }

  const { data: entities } = await query;
  const rows = (entities ?? []) as EntityRow[];
  if (rows.length === 0) return [];

  const { data: explainers } = await admin
    .from("entity_explainers")
    .select("entity_id, status, updated_at")
    .in("entity_id", rows.map((e) => e.id));

  const byEntity = new Map<string, { status: string; updated_at: string }>();
  for (const ex of (explainers ?? []) as { entity_id: string; status: string; updated_at: string }[]) {
    byEntity.set(ex.entity_id, { status: ex.status, updated_at: ex.updated_at });
  }

  const needs = rows.filter((e) => {
    const ex = byEntity.get(e.id);
    if (!ex) return true; // never generated
    // Regenerate only when fresh stories arrived after the last write (stale).
    if (e.last_mentioned_at && new Date(e.last_mentioned_at) > new Date(ex.updated_at)) return true;
    return false;
  });

  return slug ? needs : needs.slice(0, batch);
}

async function getContextStories(admin: SupabaseClient, entityId: string): Promise<ContextStory[]> {
  const { data: mentions } = await admin
    .from("entity_mentions")
    .select("story_id")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false }) // most-recent mentions, not arbitrary 60
    .limit(60);
  const ids = (mentions ?? []).map((m) => (m as { story_id: string }).story_id);
  if (ids.length === 0) return [];
  const { data } = await admin
    .from("story_archive")
    .select("id, title, summary, published_at")
    .in("id", ids)
    .order("published_at", { ascending: false })
    .limit(MAX_CONTEXT_STORIES);
  return ((data ?? []) as { id: string; title: string; summary: string }[]).map((s) => ({
    id: s.id,
    title: s.title,
    summary: s.summary,
  }));
}

// The three core sections must all be substantive; CURRENT is optional.
function coreSectionsOk(p: ParsedExplainer): boolean {
  return (
    !isBadExplainerSection(p.definition) &&
    !isBadExplainerSection(p.whyItMatters) &&
    !isBadExplainerSection(p.howItWorks)
  );
}

interface Attempt {
  parsed: ParsedExplainer;
  score: number;
  model: string;
  ok: boolean;
}

async function generateAttempt(entity: EntityRow, stories: ContextStory[], strict: boolean): Promise<Attempt> {
  const basePrompt = buildExplainerPrompt(entity.canonical_name, entity.entity_type, stories);
  const prompt = strict
    ? basePrompt + "\n\nIMPORTANT: Be conservative and factual. Omit anything you are unsure of. Do not pad."
    : basePrompt;
  const { text, model } = await callLLM(prompt, 900);
  const parsed = parseExplainer(text);
  const sectionsOk = coreSectionsOk(parsed);

  let score = 0;
  if (sectionsOk) {
    const explainerText = [parsed.definition, parsed.whyItMatters, parsed.howItWorks, parsed.currentDevelopments]
      .filter(Boolean)
      .join("\n\n");
    try {
      const critique = await callLLM(buildCritiquePrompt(entity.canonical_name, explainerText), 120);
      score = parseCritique(critique.text).score;
    } catch {
      score = 0; // critique failed → treat as low confidence → held
    }
  }
  return { parsed, score, model, ok: sectionsOk };
}

// Returns the slug if it was published (so the caller can revalidate that page),
// otherwise null.
async function processEntity(admin: SupabaseClient, entity: EntityRow, results: GenResults): Promise<string | null> {
  const stories = await getContextStories(admin, entity.id);

  // Thin-content guard: non-seed entities need real source material.
  if (!entity.is_seed && stories.length < MIN_SOURCES) {
    results.skipped++;
    return null;
  }

  let attempt = await generateAttempt(entity, stories, false);
  // One stricter retry when the first attempt is unusable or low-scoring.
  if (!attempt.ok || attempt.score < HOLD_SCORE) {
    attempt = await generateAttempt(entity, stories, true);
  }

  let status: "published" | "held";
  if (attempt.ok && attempt.score >= PUBLISH_SCORE) status = "published";
  else status = "held";

  // Canonicalise related names → slugs, drop self, cap at 5.
  const relatedSlugs = Array.from(
    new Set(
      attempt.parsed.related
        .map((name) => canonicalize(name)?.slug)
        .filter((s): s is string => !!s && s !== entity.slug)
    )
  ).slice(0, 5);

  const { error } = await admin.from("entity_explainers").upsert(
    {
      entity_id: entity.id,
      definition: attempt.parsed.definition || null,
      why_it_matters: attempt.parsed.whyItMatters || null,
      how_it_works: attempt.parsed.howItWorks || null,
      current_developments: attempt.parsed.currentDevelopments || null,
      related_slugs: relatedSlugs,
      citation_story_ids: stories.map((s) => s.id),
      model_used: attempt.model,
      quality_score: attempt.score,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "entity_id" }
  );

  if (error) {
    results.errors.push(`${entity.slug}: ${error.message}`);
    return null;
  }
  if (status === "published") {
    results.published++;
    return entity.slug;
  }
  results.held++;
  return null;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // A writer cron is useless (and wastes LLM calls) without the service role key.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for generation" },
      { status: 500 }
    );
  }

  const admin = getAdmin();
  const slug = request.nextUrl.searchParams.get("slug");
  const batch = parseInt(request.nextUrl.searchParams.get("limit") ?? String(DEFAULT_BATCH), 10);

  const entities = await selectEntities(admin, Number.isFinite(batch) ? batch : DEFAULT_BATCH, slug);
  const results: GenResults = { considered: entities.length, published: 0, held: 0, skipped: 0, errors: [] };
  const publishedSlugs: string[] = [];

  for (let i = 0; i < entities.length; i += GEN_CONCURRENCY) {
    const settled = await Promise.allSettled(
      entities.slice(i, i + GEN_CONCURRENCY).map((e) => processEntity(admin, e, results))
    );
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) publishedSlugs.push(r.value);
      else if (r.status === "rejected") results.errors.push(String(r.reason));
    }
  }

  // Push freshly-published pages live now instead of waiting up to an hour for
  // ISR — otherwise a crawler in that window indexes the thin/noindex state.
  try {
    for (const s of publishedSlugs) revalidatePath(`/learn/${s}`);
    if (publishedSlugs.length > 0) revalidatePath("/explore");
  } catch {
    /* best-effort */
  }

  return Response.json({ ...results, revalidated: publishedSlugs.length });
}
