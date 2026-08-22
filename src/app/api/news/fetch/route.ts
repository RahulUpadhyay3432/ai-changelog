import type { NextRequest } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import {
  fetchProductHuntPosts,
  type PHFeedItem,
} from "@/lib/producthunt";
import {
  fetchGitHubTrendingRepos,
  buildGitHubContent,
  type GitHubRepo,
} from "@/lib/github";
import type { CategorySlug } from "@/lib/types";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendMorningNotification } from "@/lib/push";
import { isBadSummary } from "@/lib/quality";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { fetchPageMeta } from "@/lib/page-meta";
import { feedCutoffISO } from "@/lib/feed-window";
import {
  canonicalize,
  parseExtractedEntities,
  type ExtractedEntity,
} from "@/lib/entities";

export const runtime = "nodejs";
// 800s is the Pro + Fluid compute ceiling (Hobby caps at 300s). Sized off real
// data: every run under the old 300s limit finished at 301-305s, i.e. the
// platform was killing ingestion mid-pass every single time. That was invisible
// while the summarizer failed instantly; once DeepSeek started doing real work
// the run needed more clock than the function was allowed.
export const maxDuration = 800;

// Valid category slugs — used for AI classifier validation
const VALID_SLUGS: CategorySlug[] = [
  "ai-models", "dev-tools", "open-source", "startups", "research",
  "funding-ma", "big-tech", "infrastructure", "policy",
];

const RSS_FEEDS: { url: string; defaultCategory: CategorySlug; sourceName: string; maxItems?: number }[] = [
  // ── Model labs — first-party announcements ────────────────────────────────
  { url: "https://openai.com/blog/rss.xml",                               defaultCategory: "ai-models",      sourceName: "OpenAI Blog" },
  // Note: Anthropic has no public RSS — covered via TechCrunch/The Decoder
  { url: "https://the-decoder.com/feed/",                                 defaultCategory: "ai-models",      sourceName: "The Decoder" },

  // ── Big tech — official blogs (catches cross-team launches like MS Discovery)
  { url: "https://blog.google/technology/ai/rss/",                        defaultCategory: "big-tech",       sourceName: "Google AI Blog" },
  { url: "https://deepmind.google/blog/rss.xml",                          defaultCategory: "research",       sourceName: "Google DeepMind" },
  { url: "https://blogs.microsoft.com/feed/",                             defaultCategory: "big-tech",       sourceName: "Microsoft Blog" },
  { url: "https://syncedreview.com/feed/",                                defaultCategory: "research",       sourceName: "Synced" },
  { url: "https://www.microsoft.com/en-us/research/feed/",                defaultCategory: "research",       sourceName: "Microsoft Research" },
  // Azure service updates feed removed — it's an ops feed for Azure teams, not a news feed.
  // Major Azure AI announcements (OpenAI GA, Foundry, etc.) are covered by Microsoft AI Blog.
  { url: "https://engineering.fb.com/feed/",                              defaultCategory: "ai-models",      sourceName: "Meta Engineering" },
  { url: "https://aws.amazon.com/blogs/machine-learning/feed/",           defaultCategory: "infrastructure", sourceName: "AWS ML Blog" },
  { url: "https://blogs.nvidia.com/blog/category/generative-ai/feed/",   defaultCategory: "infrastructure", sourceName: "NVIDIA AI" },
  { url: "https://machinelearning.apple.com/rss.xml",                      defaultCategory: "research",       sourceName: "Apple ML Research" },

  // ── Broad tech coverage — catches everything else ─────────────────────────
  { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", defaultCategory: "ai-models",  sourceName: "The Verge" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab",      defaultCategory: "ai-models",      sourceName: "Ars Technica" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", defaultCategory: "ai-models",      sourceName: "TechCrunch AI" },
  { url: "https://venturebeat.com/category/ai/feed/",                     defaultCategory: "ai-models",      sourceName: "VentureBeat AI" },
  // Wired: no AI-specific RSS feed exists; full site feed is 50 items of mostly
  // non-AI content (gadgets, culture, politics) — too noisy, removed.

  // ── Research ──────────────────────────────────────────────────────────────
  { url: "https://www.technologyreview.com/feed/",                        defaultCategory: "research",       sourceName: "MIT Tech Review" },

  // ── Dev tools & OSS ───────────────────────────────────────────────────────
  { url: "https://huggingface.co/blog/feed.xml",                          defaultCategory: "dev-tools",      sourceName: "Hugging Face" },
  { url: "https://simonwillison.net/atom/everything/",                    defaultCategory: "dev-tools",      sourceName: "Simon Willison" },
  { url: "https://github.blog/feed/",                                     defaultCategory: "open-source",    sourceName: "GitHub Blog" },

  // ── Community signal — HN filtered to AI/ML/dev topics with 50+ points ──
  // hnrss.org supports ?q= (title keyword filter) and ?points= (min upvotes).
  // Without these params, HN frontpage includes diet science, philosophy, life
  // advice — anything popular with programmers but not relevant to this feed.
  { url: "https://hnrss.org/frontpage?q=AI+LLM+GPT+machine+learning+Claude+Anthropic+OpenAI+agent&points=50", defaultCategory: "dev-tools", sourceName: "Hacker News" },

  // ── Additional coverage ───────────────────────────────────────────────────
  { url: "https://www.artificialintelligence-news.com/feed/",             defaultCategory: "ai-models",      sourceName: "AI News" },
  { url: "https://changelog.com/news/feed",                                defaultCategory: "open-source",    sourceName: "Changelog" },

  // ── India ─────────────────────────────────────────────────────────────────
  // The Western feeds above only catch Indian AI news when they happen to cover
  // it (e.g. Sarvam via TechCrunch). These close that gap. The Google News query
  // is the "miss nothing" net: AI-scoped via the query, India-scoped via gl/ceid,
  // pulling every outlet incl. ones with no RSS (Analytics India Magazine, NDTV,
  // Forbes India). The direct feeds add clean attribution + images for the two
  // verticals that matter most (startups/funding, enterprise AI).
  { url: "https://news.google.com/rss/search?q=(%22artificial%20intelligence%22%20OR%20AI%20OR%20LLM%20OR%20%22generative%20AI%22)%20(India%20OR%20Indian)%20when:3d&hl=en-IN&gl=IN&ceid=IN:en", defaultCategory: "startups", sourceName: "India AI", maxItems: 12 },
  { url: "https://cio.economictimes.indiatimes.com/rss/artificial-intelligence", defaultCategory: "big-tech",  sourceName: "ET CIO" },
  { url: "https://inc42.com/feed/",                                        defaultCategory: "startups",       sourceName: "Inc42", maxItems: 8 },

  // ── Coverage-gap additions (July 2026 audit) — policy, hardware, robotics, EU, open-weight ──
  // All RSS URLs were live-fetched and confirmed valid before adding.
  { url: "https://www.transformernews.ai/feed",                            defaultCategory: "policy",         sourceName: "Transformer" },
  { url: "https://importai.substack.com/feed",                             defaultCategory: "policy",         sourceName: "Import AI" },
  { url: "https://www.interconnects.ai/feed",                              defaultCategory: "ai-models",      sourceName: "Interconnects" },
  { url: "https://www.nextplatform.com/feed/",                             defaultCategory: "infrastructure", sourceName: "The Next Platform", maxItems: 8 },
  { url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss", defaultCategory: "research",    sourceName: "IEEE Spectrum" },
  { url: "https://www.therobotreport.com/feed/",                           defaultCategory: "research",       sourceName: "The Robot Report", maxItems: 6 },
  { url: "https://www.latent.space/feed",                                  defaultCategory: "dev-tools",      sourceName: "Latent Space", maxItems: 6 },
  { url: "https://tech.eu/feed/",                                          defaultCategory: "startups",       sourceName: "Tech.eu", maxItems: 8 },
];

type ParserItem = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  description?: string;
  enclosure?: { url?: string; type?: string };
  mediaContent?: { $?: { url?: string } } | string;
  mediaThumbnail?: { $?: { url?: string } };
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, unknown>, ParserItem>({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!serviceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. Add it to Vercel env vars.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey ?? anonKey!
  );
}

function extractImageUrl(item: ParserItem): string | null {
  const mc = item.mediaContent ?? item["media:content"];
  if (mc && typeof mc === "object" && (mc as { $?: { url?: string } }).$?.url) {
    return (mc as { $: { url: string } }).$.url;
  }
  const mt = item.mediaThumbnail ?? item["media:thumbnail"];
  if (mt && typeof mt === "object" && (mt as { $?: { url?: string } }).$?.url) {
    return (mt as { $: { url: string } }).$.url;
  }
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }
  const html = (item.description ?? item.content ?? "") as string;
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (m) return m[1];
  return null;
}

// ─── Classification + Summarization ──────────────────────────────────────────

/**
 * Single-pass LLM prompt: classifies into the new taxonomy AND writes the
 * summary. One call per item — no extra round-trips.
 *
 * Returns "LOW_SIGNAL" in the SUMMARY field for minor patches.
 */
function buildClassifyAndSummarizePrompt(
  title: string,
  content: string,
  defaultCategory: string
): string {
  return `You are a tech editor for "Kapyn", a premium intelligence feed for AI developers.

Classify this dispatch into ONE category slug and write a summary.

CATEGORIES:
  ai-models      — LLMs, model releases, benchmarks, capabilities, multimodal AI
                   e.g. "GPT-5 Released", "Claude Scores SOTA on MMLU", "Gemini 2.0 Launch"
  dev-tools      — Commercial/hosted dev tools, APIs, SDKs, frameworks, CLIs, plugins
                   e.g. "LangChain 0.3 Adds Agent Memory", "Cursor Gets Multi-File Edit Mode"
  open-source    — New open-source projects, GitHub releases, OSS tools gaining traction
                   e.g. "New OSS vector DB hits 10k stars", "Show HN: CLI tool for LLM evals"
  startups       — New companies, product launches, pivots, early-stage growth
                   e.g. "Cohere Launches Enterprise Platform", "AI writing startup raises seed"
  research       — Academic papers, lab findings, benchmarks, evals, university research
                   e.g. "DeepMind Paper on Reasoning", "MIT Study on LLM Hallucination"
  funding-ma     — Funding rounds, acquisitions, mergers, acqui-hires, strategic investments
                   e.g. "Anthropic Raises $4B Series E", "Microsoft Acquires Inflection AI"
  big-tech       — FAANG+, cloud providers (AWS/GCP/Azure), enterprise AI platform updates
                   e.g. "Google Releases Gemini Ultra", "AWS Bedrock Adds Claude 3"
  infrastructure — Chips, GPUs, data centers, cloud compute, hardware, edge AI deployment
                   e.g. "Nvidia H200 Now Shipping", "Meta Builds 100K GPU Cluster"
  policy         — AI regulation, governance, safety frameworks, government orders, compliance
                   e.g. "EU AI Act Enforcement Begins", "Biden Signs AI Executive Order"

If genuinely unsure, use default: ${defaultCategory}

SUMMARY RULES:
- FIRST SENTENCE: A single punchy line (10-15 words max) saying exactly what this IS. For products: "X is a [what it does]." For news: the core fact in one line.
- THEN 2-3 sentences of detail: what changed or was announced, key numbers, why it matters to AI developers
- Plain English, present tense, active voice
- Make it substantial — readers should feel informed after reading
- NEVER include raw commit messages, issue refs (#7), tag lists, or changelog boilerplate
- NEVER start with "This article", "This release", or "This post"
- If ONLY a minor patch (dep bump, typo fix, internal refactor — no user-facing change): write LOW_SIGNAL
- If it is a retirement/deprecation notice for a niche cloud service most AI developers wouldn't know (e.g. "Azure Form Recognizer v2 retiring"): write LOW_SIGNAL. But if it affects a widely-used API or platform (e.g. "OpenAI deprecates GPT-3 API"): cover it normally
- RELEVANCE GATE (strict — Kapyn is an AI feed): write OFF_TOPIC unless the story is genuinely about AI or machine learning, or the models, developer tools, infrastructure, research, funding, or policy that AI builders actually care about. A company merely being a startup or "in tech" is NOT enough — there must be a real AI/ML angle. Reject as OFF_TOPIC: consumer/D2C brands, general retail, fintech or SaaS with no AI angle, exam or education results (e.g. NEET/board results), sports, entertainment, crypto price moves, and generic business news.

ENTITY EXTRACTION:
- After the summary, list up to 6 specific named entities this story is actually ABOUT — models, tools, companies, techniques, or concepts (e.g. GPT-5, vLLM, Anthropic, RAG, mixture of experts).
- Only real subjects, not passing mentions. Use the most common canonical name. Skip generic words (AI, software, model, technology, startup).
- Output a compact JSON array on one line. If none, output [].

Respond in EXACTLY this format — no extra text before or after:
CATEGORY: <slug>
SUMMARY: <2-3 sentences or LOW_SIGNAL>
ENTITIES: [{"name":"<name>","type":"<model|tool|company|technique|concept>"}]

Title: ${title}
Content: ${content.slice(0, 2000)}`;
}

interface ClassifyResult {
  category: CategorySlug;
  summary: string; // "LOW_SIGNAL" triggers isBadSummary
  entities: ExtractedEntity[];
}

function parseClassifyResponse(text: string, fallback: CategorySlug): ClassifyResult {
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

// isBadSummary now lives in @/lib/quality (shared with the knowledge generator).

// Retry transient LLM failures (rate limits / 5xx / network blips). Most "LLM
// failed — skipped" drops were a single 429 with no retry; a short exponential
// backoff clears them and stops silently shrinking the feed.
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let a = 0; a < attempts; a++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const m = String(err);
      const transient =
        /\b(429|500|502|503|504)\b/.test(m) ||
        /fetch failed|timeout|ETIMEDOUT|ECONNRESET|overloaded|network/i.test(m);
      if (!transient || a === attempts - 1) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** a + Math.floor(Math.random() * 400)));
    }
  }
  throw lastErr;
}

// DeepSeek's OpenAI-compatible endpoint. v4-flash is the cheap tier and is more
// than capable of classify-and-summarise; verified against the real prompt, its
// output parses with parseClassifyResponse unchanged.
async function callDeepSeek(prompt: string): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY missing");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 700,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("DeepSeek returned empty response");
  return text;
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

type ClassifyOutcome =
  | { ok: true; value: ClassifyResult; provider: string }
  | { ok: false; reason: string };

/**
 * Single LLM call (Gemini only) returning both category and clean summary.
 *
 * Returns the provider's reason on failure rather than a bare null. The previous
 * `catch {}` here cost us 11 days of a frozen feed: every run reported "LLM
 * failed for <title> — skipped" with no cause, while the actual error was a
 * plain `429 RESOURCE_EXHAUSTED — prepayment credits are depleted`. Never
 * swallow this again; the reason is the whole diagnostic.
 */
// Ordered provider chain. Cheapest first; each is skipped when its key is absent.
//
// This is a chain rather than one provider because a single-provider summariser
// is a single point of failure for the entire feed: when Gemini's prepaid credits
// ran out on ~2026-08-11, ingestion kept fetching stories and dropping every one
// of them for eleven days. Any one provider can now go down without freezing the
// feed. Add keys, not conditionals.
const LLM_PROVIDERS: { name: string; envKey: string; call: (p: string) => Promise<string> }[] = [
  { name: "deepseek-v4-flash", envKey: "DEEPSEEK_API_KEY", call: callDeepSeek },
  { name: "gemini-flash-lite", envKey: "GEMINI_API_KEY", call: callGemini },
];

async function classifyAndSummarize(
  title: string,
  content: string,
  defaultCategory: CategorySlug
): Promise<ClassifyOutcome> {
  const prompt = buildClassifyAndSummarizePrompt(title, content, defaultCategory);
  const reasons: string[] = [];

  for (const provider of LLM_PROVIDERS) {
    if (!process.env[provider.envKey]) continue;
    try {
      // Retry handles transient 429/5xx within a provider; the loop handles a
      // provider being down or out of credit entirely.
      const raw = await withRetry(() => provider.call(prompt));
      return { ok: true, value: parseClassifyResponse(raw, defaultCategory), provider: provider.name };
    } catch (err) {
      reasons.push(`${provider.name}: ${String(err).slice(0, 160)}`);
    }
  }

  return {
    ok: false,
    reason: reasons.length ? reasons.join(" | ") : "no LLM provider configured",
  };
}

// ─── Feed types ───────────────────────────────────────────────────────────────

type FeedItem = {
  title: string;
  sourceUrl: string;
  sourceName: string;
  defaultCategory: CategorySlug;
  content: string;
  publishedAt: string;
  imageUrl: string | null;
};

// ─── RSS fetch ────────────────────────────────────────────────────────────────

async function fetchRSSFeed(
  feed: (typeof RSS_FEEDS)[0]
): Promise<FeedItem[]> {
  const parsed = await parser.parseURL(feed.url);

  const rawItems = (parsed.items ?? []).slice(0, feed.maxItems ?? 10).map((item) => {
    const rawContent =
      item.contentSnippet ?? item.content ?? item.summary ?? item.description ?? "";
    const content = rawContent.trim() || (item.title ?? "");
    const rawTitle = item.title ?? "";
    const title = rawTitle.replace(/^(Show HN|Ask HN|Tell HN):\s*/i, "").trim();
    return {
      title,
      sourceUrl: item.link ?? item.guid ?? "",
      sourceName: feed.sourceName,
      defaultCategory: feed.defaultCategory,
      content,
      publishedAt: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      imageUrl: extractImageUrl(item),
    };
  });

  const metaResults = await Promise.allSettled(
    rawItems.map((item) => fetchPageMeta(item.sourceUrl))
  );

  return rawItems.map((item, i) => {
    const meta =
      metaResults[i].status === "fulfilled"
        ? metaResults[i].value
        : { imageUrl: null, description: null, title: null };
    return { ...item, imageUrl: meta.imageUrl ?? item.imageUrl };
  });
}

// ─── Product Hunt feed items ──────────────────────────────────────────────────

function phPostsToFeedItems(posts: PHFeedItem[]): FeedItem[] {
  return posts.map((post) => ({
    title: post.title,
    sourceUrl: post.sourceUrl,
    sourceName: "Product Hunt",
    // Default to startups (most PH launches are products); classifier may override
    defaultCategory: "startups" as CategorySlug,
    content: [post.tagline, post.description].filter(Boolean).join(". "),
    publishedAt: post.publishedAt,
    imageUrl: post.imageUrl,
  }));
}

// ─── GitHub feed items ────────────────────────────────────────────────────────

function githubReposToFeedItems(repos: GitHubRepo[]): FeedItem[] {
  return repos.map((repo) => ({
    // Title: "repo-name — one-line description" so cards are readable without
    // the full summary. Falls back to just the repo name if no description.
    title: repo.description
      ? `${repo.name} — ${repo.description.slice(0, 120)}`
      : repo.name,
    sourceUrl: repo.htmlUrl,
    sourceName: "GitHub",
    defaultCategory: "open-source" as CategorySlug,
    content: buildGitHubContent(repo),
    publishedAt: repo.createdAt,
    imageUrl: null,
  }));
}

// ─── Insert pipeline ──────────────────────────────────────────────────────────

const INSERT_CONCURRENCY = 3; // parallel LLM calls — lower + retry keeps us under provider rate limits

type IngestResults = {
  inserted: number;
  skipped: number;
  lowSignal: number;
  /** Items dropped because the LLM call failed. Non-zero = ingestion is broken. */
  llmFailed: number;
  /** First provider error seen, verbatim — the thing you actually need to debug. */
  llmError: string | null;
  /** Which provider(s) produced summaries this run. */
  llmProviders: Record<string, number>;
  entitiesUpserted: number;
  mentionsLinked: number;
  errors: string[];
};

// Mirror an inserted story into the durable story_archive (insert-or-ignore on
// source_url) and return the canonical archive id. news_items rotates every 48h
// but the archive never does — so the knowledge graph and /digest keep working.
// For a re-seen URL the existing archive id is returned (NOT overwritten), which
// is why we can't use a replacing upsert here.
async function mirrorToArchive(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  id: string,
  item: FeedItem,
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

// Canonicalise + atomically upsert each extracted entity and its mention via the
// kb_upsert_entity_mention RPC. Dedupes within a story by slug.
async function linkEntities(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  storyId: string,
  entities: ExtractedEntity[],
  results: IngestResults
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

async function insertItems(
  items: FeedItem[],
  supabase: ReturnType<typeof getSupabaseAdmin>,
  results: IngestResults
) {
  const validItems = items.filter(i => i.title && i.sourceUrl);
  if (validItems.length === 0) return;

  // ── Batch dedup: one query instead of N sequential maybeSingle calls ─────
  const urls = validItems.map(i => i.sourceUrl);
  const { data: existingRows } = await supabase
    .from("news_items")
    .select("source_url")
    .in("source_url", urls);
  const existingUrls = new Set((existingRows ?? []).map((r: { source_url: string }) => r.source_url));

  const newItems = validItems.filter(i => !existingUrls.has(i.sourceUrl));
  results.skipped += validItems.length - newItems.length;

  // ── Process new items with bounded concurrency ────────────────────────────
  const processOne = async (item: FeedItem) => {
    const outcome = await classifyAndSummarize(item.title, item.content, item.defaultCategory);
    if (!outcome.ok) {
      results.llmFailed++;
      // Keep the first reason verbatim; the per-item lines stay terse so a
      // provider outage doesn't bury it under a hundred identical errors.
      if (!results.llmError) {
        results.llmError = outcome.reason;
        results.errors.push(`LLM failed — ${outcome.reason}`);
      }
      results.errors.push(`LLM failed for "${item.title}" — skipped`);
      return;
    }
    results.llmProviders[outcome.provider] = (results.llmProviders[outcome.provider] ?? 0) + 1;
    const { category, summary, entities } = outcome.value;
    if (isBadSummary(summary)) { results.lowSignal++; return; }

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
      results.errors.push(`Insert "${item.title}": ${error?.message ?? "no row"}`);
      return;
    }
    results.inserted++;

    // Knowledge-graph enrichment is best-effort: a failure here must NEVER
    // affect the news insert above, so it's isolated in its own try/catch.
    try {
      const archiveId = await mirrorToArchive(supabase, inserted.id, item, summary, category);
      if (archiveId && entities.length > 0) {
        await linkEntities(supabase, archiveId, entities, results);
      }
    } catch (err) {
      results.errors.push(`KB enrich "${item.title}": ${String(err)}`);
    }
  };

  for (let i = 0; i < newItems.length; i += INSERT_CONCURRENCY) {
    await Promise.allSettled(newItems.slice(i, i + INSERT_CONCURRENCY).map(processOne));
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get("mode");
  const supabase = getSupabaseAdmin();

  // ── Re-summarize mode ──────────────────────────────────────────────────────
  if (mode === "resummary") {
    const limitParam = parseInt(request.nextUrl.searchParams.get("limit") ?? "30", 10);
    const offsetParam = parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10);

    const { data: items } = await supabase
      .from("news_items")
      .select("id, title, summary, category_slug")
      .order("created_at", { ascending: false });

    const short = (items ?? [])
      .filter((i: { summary: string }) => i.summary.trim().split(/\s+/).filter(Boolean).length < 45)
      .slice(offsetParam, offsetParam + limitParam);

    const totalShort = (items ?? []).filter(
      (i: { summary: string }) => i.summary.trim().split(/\s+/).filter(Boolean).length < 45
    ).length;

    const results = {
      updated: 0,
      errors: [] as string[],
      remaining: Math.max(0, totalShort - offsetParam - limitParam),
    };

    for (let i = 0; i < short.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 10000));
      const item = short[i];
      try {
        const r = await classifyAndSummarize(
          item.title,
          item.title,
          (item.category_slug as CategorySlug) ?? "ai-models"
        );
        if (!r.ok || isBadSummary(r.value.summary)) {
          results.errors.push(
            !r.ok
              ? `Re-summary failed for "${item.title}" — ${r.reason}`
              : `Bad re-summary skipped for "${item.title}"`,
          );
          continue;
        }
        const { error } = await supabase
          .from("news_items")
          .update({ summary: r.value.summary, category_slug: r.value.category })
          .eq("id", item.id);
        if (error) results.errors.push(`Update ${item.id}: ${error.message}`);
        else results.updated++;
      } catch (err) {
        results.errors.push(`Summarize "${item.title}": ${String(err)}`);
      }
    }

    return Response.json(results);
  }

  // ── Reclassify mode — migrate old slugs ────────────────────────────────────
  if (mode === "reclassify") {
    const migrated: Record<string, number> = {};

    // Simple deterministic renames — no AI needed
    const renames: Array<[string, CategorySlug]> = [
      ["tools",       "dev-tools"],
      ["funding",     "funding-ma"],
      ["producthunt", "startups"],
    ];

    for (const [oldSlug, newSlug] of renames) {
      const { data, error } = await supabase
        .from("news_items")
        .update({ category_slug: newSlug })
        .eq("category_slug", oldSlug)
        .select("id");
      if (!error) migrated[`${oldSlug}→${newSlug}`] = data?.length ?? 0;
    }

    return Response.json({ migrated });
  }

  // ── Archive backfill — one-off: seed story_archive from current news_items ──
  // Run once after the migration so concept pages have history before the next
  // 48h delete. Idempotent (insert-or-ignore on source_url).
  if (mode === "archive-backfill") {
    const { data: items } = await supabase
      .from("news_items")
      .select("id, title, summary, source_url, source_name, category_slug, image_url, published_at");
    let archived = 0;
    for (const row of items ?? []) {
      const { error } = await supabase.from("story_archive").upsert(
        {
          id: row.id,
          title: row.title,
          summary: row.summary,
          source_url: row.source_url,
          source_name: row.source_name,
          category_slug: row.category_slug,
          image_url: row.image_url,
          published_at: row.published_at,
        },
        { onConflict: "source_url", ignoreDuplicates: true }
      );
      if (!error) archived++;
    }
    return Response.json({ archived, scanned: (items ?? []).length });
  }

  // ── Restore window — one-off: repopulate news_items from story_archive so a
  // widened feed window (feed-window.ts) has immediate history instead of only
  // filling going forward. Idempotent (insert-or-ignore on source_url).
  if (mode === "restore-window") {
    const restoreCutoff = feedCutoffISO();
    const { data: archived } = await supabase
      .from("story_archive")
      .select("id, title, summary, source_url, source_name, category_slug, image_url, published_at")
      .gte("published_at", restoreCutoff);
    let restored = 0;
    for (const row of archived ?? []) {
      const { error } = await supabase.from("news_items").upsert(
        {
          id: row.id,
          title: row.title,
          summary: row.summary,
          source_url: row.source_url,
          source_name: row.source_name,
          category_slug: row.category_slug,
          image_url: row.image_url,
          published_at: row.published_at,
        },
        { onConflict: "source_url", ignoreDuplicates: true }
      );
      if (!error) restored++;
    }
    return Response.json({ restored, scanned: (archived ?? []).length });
  }

  // ── Normal fetch ───────────────────────────────────────────────────────────

  // Clean up leaked prompt strings and off-topic summaries already in DB
  await supabase.from("news_items").delete().ilike("summary", "Write a 40%");
  await supabase.from("news_items").delete().ilike("summary", "The provided content%");
  await supabase.from("news_items").delete().ilike("summary", "%summarize this article%");
  await supabase.from("news_items").delete().ilike("summary", "This article%");
  await supabase.from("news_items").delete().ilike("summary", "This post%");
  await supabase.from("news_items").delete().ilike("summary", "This content is not%");
  await supabase.from("news_items").delete().ilike("summary", "%not related to AI%");
  await supabase.from("news_items").delete().ilike("summary", "%not related to tech%");

  // Remove stale items older than the feed window (see feed-window.ts)
  const cutoff = feedCutoffISO();
  await supabase.from("news_items").delete().lt("published_at", cutoff);

  // Idempotent slug migrations (runs harmlessly after first pass)
  await supabase.from("news_items").update({ category_slug: "dev-tools"  }).eq("category_slug", "tools");
  await supabase.from("news_items").update({ category_slug: "funding-ma" }).eq("category_slug", "funding");
  await supabase.from("news_items").update({ category_slug: "startups"   }).eq("category_slug", "producthunt");

  const results: IngestResults = {
    inserted: 0, skipped: 0, lowSignal: 0,
    llmFailed: 0, llmError: null, llmProviders: {},
    entitiesUpserted: 0, mentionsLinked: 0, errors: [],
  };

  // RSS feeds — parallel fetch
  const rssSettled = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchRSSFeed(feed))
  );

  for (let i = 0; i < rssSettled.length; i++) {
    const result = rssSettled[i];
    if (result.status === "fulfilled") {
      await insertItems(result.value, supabase, results);
    } else {
      results.errors.push(`RSS "${RSS_FEEDS[i].url}": ${String(result.reason)}`);
    }
  }

  // Product Hunt GraphQL
  try {
    const phPosts = await fetchProductHuntPosts(48);
    const phItems = phPostsToFeedItems(phPosts);
    await insertItems(phItems, supabase, results);
  } catch (err) {
    results.errors.push(`Product Hunt API: ${String(err)}`);
  }

  // GitHub trending — new AI/ML repos going viral in the last 48h
  try {
    const ghRepos = await fetchGitHubTrendingRepos(48);
    const ghItems = githubReposToFeedItems(ghRepos);
    await insertItems(ghItems, supabase, results);
  } catch (err) {
    results.errors.push(`GitHub API: ${String(err)}`);
  }

  // Track fetch completion server-side
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: "cron-job",
    event: "news_fetch_completed",
    properties: {
      inserted: results.inserted,
      skipped: results.skipped,
      low_signal: results.lowSignal,
      llm_failed: results.llmFailed,
      llm_error: results.llmError,
      llm_providers: JSON.stringify(results.llmProviders),
      entities_upserted: results.entitiesUpserted,
      mentions_linked: results.mentionsLinked,
      errors: results.errors.length,
    },
  });

  // Morning notification — only at 02:xx UTC, only when new items were inserted
  const hourUTC = new Date().getUTCHours();
  if (results.inserted > 0 && hourUTC === 2) {
    try {
      await sendMorningNotification(supabase, results.inserted);
      posthog.capture({
        distinctId: "cron-job",
        event: "push_notification_sent",
        properties: { count: results.inserted },
      });
    } catch (err) {
      console.error("Morning notification failed:", err);
    }
  }

  await posthog.shutdown();

  return Response.json(results);
}
