import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategorySlug } from "@/lib/types";
import {
  canonicalize,
  parseExtractedEntities,
  type ExtractedEntity,
} from "@/lib/entities";

// Moved out of api/news/fetch/route.ts unchanged so both the Vercel cron path
// and the HERMES backlog path (src/app/api/hermes/results/route.ts) share one
// implementation of "what a story looks like once we have a category + summary".

export const VALID_SLUGS: CategorySlug[] = [
  "ai-models", "dev-tools", "open-source", "startups", "research",
  "funding-ma", "big-tech", "infrastructure", "policy",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = SupabaseClient<any, "public", any>;

// ─── Classification + Summarization prompt ───────────────────────────────────

/**
 * Single-pass LLM prompt: classifies into the new taxonomy AND writes the
 * summary. One call per item — no extra round-trips.
 *
 * Returns "LOW_SIGNAL" in the SUMMARY field for minor patches.
 */
export function buildClassifyAndSummarizePrompt(
  title: string,
  content: string,
  defaultCategory: string
): string {
  return `You are a tech editor for "Kapyn", a premium intelligence feed for AI developers.

Classify this dispatch into ONE category slug and write a summary.

CATEGORIES:
  ai-models, LLMs, model releases, benchmarks, capabilities, multimodal AI
                   e.g. "GPT-5 Released", "Claude Scores SOTA on MMLU", "Gemini 2.0 Launch"
  dev-tools      , Commercial/hosted dev tools, APIs, SDKs, frameworks, CLIs, plugins
                   e.g. "LangChain 0.3 Adds Agent Memory", "Cursor Gets Multi-File Edit Mode"
  open-source    , New open-source projects, GitHub releases, OSS tools gaining traction
                   e.g. "New OSS vector DB hits 10k stars", "Show HN: CLI tool for LLM evals"
  startups       , New companies, product launches, pivots, early-stage growth
                   e.g. "Cohere Launches Enterprise Platform", "AI writing startup raises seed"
  research       , Academic papers, lab findings, benchmarks, evals, university research
                   e.g. "DeepMind Paper on Reasoning", "MIT Study on LLM Hallucination"
  funding-ma     , Funding rounds, acquisitions, mergers, acqui-hires, strategic investments
                   e.g. "Anthropic Raises $4B Series E", "Microsoft Acquires Inflection AI"
  big-tech       , FAANG+, cloud providers (AWS/GCP/Azure), enterprise AI platform updates
                   e.g. "Google Releases Gemini Ultra", "AWS Bedrock Adds Claude 3"
  infrastructure , Chips, GPUs, data centers, cloud compute, hardware, edge AI deployment
                   e.g. "Nvidia H200 Now Shipping", "Meta Builds 100K GPU Cluster"
  policy         , AI regulation, governance, safety frameworks, government orders, compliance
                   e.g. "EU AI Act Enforcement Begins", "Biden Signs AI Executive Order"

If genuinely unsure, use default: ${defaultCategory}

SUMMARY RULES:
- FIRST SENTENCE: A single punchy line (10-15 words max) saying exactly what this IS. For products: "X is a [what it does]." For news: the core fact in one line.
- THEN 2-3 sentences of detail: what changed or was announced, key numbers, why it matters to AI developers
- Plain English, present tense, active voice
- Make it substantial , readers should feel informed after reading
- NEVER include raw commit messages, issue refs (#7), tag lists, or changelog boilerplate
- NEVER start with "This article", "This release", or "This post"
- NEVER use em dashes. Use a comma, a colon, or a full stop instead. Em dashes read as machine-written
- If ONLY a minor patch (dep bump, typo fix, internal refactor , no user-facing change): write LOW_SIGNAL
- If it is a retirement/deprecation notice for a niche cloud service most AI developers wouldn't know (e.g. "Azure Form Recognizer v2 retiring"): write LOW_SIGNAL. But if it affects a widely-used API or platform (e.g. "OpenAI deprecates GPT-3 API"): cover it normally
- RELEVANCE GATE (strict , Kapyn is an AI feed): write OFF_TOPIC unless the story is genuinely about AI or machine learning, or the models, developer tools, infrastructure, research, funding, or policy that AI builders actually care about. A company merely being a startup or "in tech" is NOT enough , there must be a real AI/ML angle. Reject as OFF_TOPIC: consumer/D2C brands, general retail, fintech or SaaS with no AI angle, exam or education results (e.g. NEET/board results), sports, entertainment, crypto price moves, and generic business news.

ENTITY EXTRACTION:
- After the summary, list up to 6 specific named entities this story is actually ABOUT , models, tools, companies, techniques, or concepts (e.g. GPT-5, vLLM, Anthropic, RAG, mixture of experts).
- Only real subjects, not passing mentions. Use the most common canonical name. Skip generic words (AI, software, model, technology, startup).
- Output a compact JSON array on one line. If none, output [].

Respond in EXACTLY this format , no extra text before or after:
CATEGORY: <slug>
SUMMARY: <2-3 sentences or LOW_SIGNAL>
ENTITIES: [{"name":"<name>","type":"<model|tool|company|technique|concept>"}]

Title: ${title}
Content: ${content.slice(0, 2000)}`;
}

export interface ClassifyResult {
  category: CategorySlug;
  summary: string; // "LOW_SIGNAL" triggers isBadSummary
  entities: ExtractedEntity[];
}

export function parseClassifyResponse(text: string, fallback: CategorySlug): ClassifyResult {
  const categoryMatch = text.match(/CATEGORY:\s*(\S+)/);
  // Summary runs from "SUMMARY:" up to the ENTITIES marker (or end of text), so
  // the entities JSON never leaks into the summary body. The boundary tolerates
  // the LLM putting ENTITIES on the same line (no preceding newline) — it just
  // has to be followed by the opening "[".
  const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?:\s*ENTITIES:\s*\[|\s*$)/);
  const entitiesMatch = text.match(/ENTITIES:\s*(\[[\s\S]*?\])/);

  const rawSlug = categoryMatch?.[1]?.trim() ?? "";
  const category: CategorySlug = VALID_SLUGS.includes(rawSlug as CategorySlug)
    ? (rawSlug as CategorySlug)
    : fallback;

  const summary = summaryMatch?.[1]?.trim() ?? "";
  const entities = parseExtractedEntities(entitiesMatch?.[1]);
  return { category, summary, entities };
}

// ─── Persistence: news_items insert → archive → entities ────────────────────

// Minimal shape persistStory needs from a story, shared by the RSS/PH/GitHub
// feed pipeline (FeedItem in route.ts) and the HERMES backlog row.
export interface StoryLike {
  title: string;
  sourceUrl: string;
  sourceName: string;
  imageUrl: string | null;
  publishedAt: string;
}

// Mirror an inserted story into the durable story_archive (insert-or-ignore on
// source_url) and return the canonical archive id. news_items rotates on the
// feed window but the archive never does — so the knowledge graph and /digest
// keep working. For a re-seen URL the existing archive id is returned (NOT
// overwritten), which is why we can't use a replacing upsert here.
export async function mirrorToArchive(
  supabase: SupabaseAdmin,
  id: string,
  item: StoryLike,
  summary: string,
  category: CategorySlug
): Promise<string | null> {
  await supabase.from("story_archive").upsert(
    {
      id,
      title: item.title,
      summary,
      source_url: item.sourceUrl,
      source_name: item.sourceName,
      category_slug: category,
      image_url: item.imageUrl,
      published_at: item.publishedAt,
    },
    { onConflict: "source_url", ignoreDuplicates: true }
  );
  const { data } = await supabase
    .from("story_archive")
    .select("id")
    .eq("source_url", item.sourceUrl)
    .single();
  return data?.id ?? null;
}

// Bookkeeping linkEntities needs from the caller — IngestResults (route.ts)
// satisfies this structurally; persistStory's own return also does.
export interface EntityLinkResults {
  entitiesUpserted: number;
  mentionsLinked: number;
  errors: string[];
}

// Canonicalise + atomically upsert each extracted entity and its mention via the
// kb_upsert_entity_mention RPC. Dedupes within a story by slug.
export async function linkEntities(
  supabase: SupabaseAdmin,
  storyId: string,
  entities: ExtractedEntity[],
  results: EntityLinkResults
): Promise<void> {
  const seen = new Set<string>();
  for (const e of entities) {
    const c = canonicalize(e.name, e.type);
    if (!c || seen.has(c.slug)) continue;
    seen.add(c.slug);
    const { error } = await supabase.rpc("kb_upsert_entity_mention", {
      p_slug: c.slug,
      p_name: c.canonicalName,
      p_type: c.entityType,
      p_alias: c.alias,
      p_story_id: storyId,
    });
    if (error) {
      results.errors.push(`Entity "${c.slug}": ${error.message}`);
    } else {
      results.entitiesUpserted++;
      results.mentionsLinked++;
    }
  }
}

export interface PersistOutcome {
  ok: true;
  id: string;
  duplicate: boolean;
  entitiesUpserted: number;
  mentionsLinked: number;
  errors: string[];
}

export interface PersistFailure {
  ok: false;
  error: string;
}

/**
 * The insert -> archive -> entities block, lifted unchanged out of
 * api/news/fetch/route.ts's processOne so both ingestion paths (normal RSS
 * pipeline, HERMES backlog submission) persist a story identically.
 *
 * A unique-violation on news_items.source_url (Postgres 23505) is treated as
 * already-done rather than an error: the HERMES contract requires
 * POST /api/hermes/results to be idempotent, and it's also possible (if rare)
 * for the same source_url to reach two processOne calls in one normal run.
 */
export async function persistStory(
  supabase: SupabaseAdmin,
  item: StoryLike,
  result: { category: CategorySlug; summary: string; entities: ExtractedEntity[] }
): Promise<PersistOutcome | PersistFailure> {
  const { category, summary, entities } = result;

  const { data: inserted, error } = await supabase
    .from("news_items")
    .insert({
      title: item.title,
      summary,
      source_url: item.sourceUrl,
      source_name: item.sourceName,
      category_slug: category,
      published_at: item.publishedAt,
      image_url: item.imageUrl,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      const { data: existing } = await supabase
        .from("news_items")
        .select("id")
        .eq("source_url", item.sourceUrl)
        .single();
      if (existing?.id) {
        return { ok: true, id: existing.id, duplicate: true, entitiesUpserted: 0, mentionsLinked: 0, errors: [] };
      }
    }
    return { ok: false, error: error?.message ?? "no row returned from insert" };
  }

  // Knowledge-graph enrichment is best-effort: a failure here must NEVER
  // affect the news insert above, so it's isolated in its own try/catch.
  const errors: string[] = [];
  let entitiesUpserted = 0;
  let mentionsLinked = 0;
  try {
    const archiveId = await mirrorToArchive(supabase, inserted.id, item, summary, category);
    if (archiveId && entities.length > 0) {
      const linkResults: EntityLinkResults = { entitiesUpserted: 0, mentionsLinked: 0, errors: [] };
      await linkEntities(supabase, archiveId, entities, linkResults);
      entitiesUpserted = linkResults.entitiesUpserted;
      mentionsLinked = linkResults.mentionsLinked;
      errors.push(...linkResults.errors);
    }
  } catch (err) {
    errors.push(`KB enrich "${item.title}": ${String(err)}`);
  }

  return { ok: true, id: inserted.id, duplicate: false, entitiesUpserted, mentionsLinked, errors };
}
