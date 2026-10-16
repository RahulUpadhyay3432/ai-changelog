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
import { isBadSummary, rejectionReason, type RejectionReason } from "@/lib/quality";
import { LLM_PROVIDERS, withRetry } from "@/lib/llm-providers";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { fetchPageMeta } from "@/lib/page-meta";
import { feedCutoffISO } from "@/lib/feed-window";
import {
  buildClassifyAndSummarizePrompt,
  parseClassifyResponse,
  persistStory,
  type ClassifyResult,
} from "@/lib/news-ingest";

export const runtime = "nodejs";
// 800s is the Pro + Fluid compute ceiling (Hobby caps at 300s). Sized off real
// data: every run under the old 300s limit finished at 301-305s, i.e. the
// platform was killing ingestion mid-pass every single time. That was invisible
// while the summarizer failed instantly; once DeepSeek started doing real work
// the run needed more clock than the function was allowed.
export const maxDuration = 800;

const RSS_FEEDS: { url: string; defaultCategory: CategorySlug; sourceName: string; maxItems?: number }[] = [
  // ── Model labs — first-party announcements ────────────────────────────────
  { url: "https://openai.com/blog/rss.xml",                               defaultCategory: "ai-models",      sourceName: "OpenAI Blog" },
  { url: "https://mistral.ai/rss.xml",                                    defaultCategory: "ai-models",      sourceName: "Mistral AI" },
  { url: "https://the-decoder.com/feed/",                                 defaultCategory: "ai-models",      sourceName: "The Decoder" },
  // models.ts tracks Grok, DeepSeek, Kimi, Qwen, GLM and Mistral as families, but only
  // Mistral publishes a feed. Checked 2026-09-04, so the next person does not repeat it:
  //   xAI          x.ai/{news,blog}/rss.xml, /rss.xml, /feed.xml   403 to non-browsers
  //   DeepSeek     api-docs.deepseek.com/rss.xml                   200 but zero items
  //   Moonshot     moonshotai.github.io/{feed,blog/index}.xml      404
  //   Z.ai (GLM)   z.ai/{blog/rss,rss,feed}.xml                    404
  //   Anthropic    anthropic.com/{rss,news/rss,feed}.xml           404, still no feed
  //   Qwen         qwenlm.github.io/blog/index.xml                 200, 44 items, but the
  //                newest is Sep 2025. The blog is abandoned; Qwen ships to Hugging Face
  //                now. Adding it would have looked like coverage and delivered none.
  // openai.com/blog/rss.xml above is the legacy path but 301s to /news/rss.xml and serves
  // the full 1,169 items, so it stays. The gap these leave is Chinese and xAI releases;
  // closing it properly means a Hugging Face releases source, not another RSS URL.

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
    console.warn("SUPABASE_SERVICE_ROLE_KEY not set, falling back to anon key. Add it to Vercel env vars.");
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
// buildClassifyAndSummarizePrompt / parseClassifyResponse now live in
// @/lib/news-ingest (shared with the HERMES backlog path). isBadSummary lives
// in @/lib/quality (shared with the knowledge generator). The provider chain
// itself lives in @/lib/llm-providers (shared with /api/breakdown).

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

// Auth/balance/missing key won't recover mid-run: drop the provider at once. "key(s)
// exhausted" is also what a per-minute 429 burst looks like, so it takes several in a row.
// 404 belongs here with the auth failures: it means the model slug or endpoint does
// not exist, which cannot come back mid-run. It was missing, so every story re-tried
// OpenRouter's retired `:free` slug and paid the round trip to learn the same thing
// ~150 times a run. 400 is deliberately NOT included — it can be one story's content
// rather than the provider, and killing a working provider over one item is worse.
const DEAD_PROVIDER_PATTERN = /\b(401|402|403|404)\b|API_KEY missing/i;
const EXHAUSTED_PATTERN = /key\(s\) exhausted/i;
const EXHAUSTED_STRIKES = 3;

/** Per-request (never module-level: Fluid Compute reuses instances). */
type ProviderHealth = {
  dead: string[];
  strikes: Record<string, number>;
  /** First error seen per provider. `deadProviders` named who died and never why,
   *  so a provider could fail every call of a run and leave no diagnosable trace. */
  errors: Record<string, string>;
  /** How many stories each provider was asked to handle. A provider with 0 here
   *  was never reached; with many and no successes, it is failing silently. */
  attempts: Record<string, number>;
  /** Providers skipped entirely for a missing key. Without this, a provider whose
   *  env var did not reach the deployment is invisible: absent from the used list
   *  AND from the dead list, which is exactly how zai-glm vanished on run
   *  37073036239 with no way to tell a missing key from a silent failure. */
  skipped: Record<string, string>;
};

async function classifyAndSummarize(
  title: string,
  content: string,
  defaultCategory: CategorySlug,
  health: ProviderHealth = { dead: [], strikes: {}, errors: {}, attempts: {}, skipped: {} }
): Promise<ClassifyOutcome> {
  const prompt = buildClassifyAndSummarizePrompt(title, content, defaultCategory);
  const reasons: string[] = [];

  for (const provider of LLM_PROVIDERS) {
    if (!process.env[provider.envKey]) {
      health.skipped[provider.name] = `${provider.envKey} not set`;
      continue;
    }
    if (health.dead.includes(provider.name)) continue;
    health.attempts[provider.name] = (health.attempts[provider.name] ?? 0) + 1;
    try {
      // Retry handles transient 429/5xx within a provider; the loop handles a
      // provider being down or out of credit entirely.
      const raw = await withRetry(() => provider.call(prompt));
      health.strikes[provider.name] = 0;
      return { ok: true, value: parseClassifyResponse(raw, defaultCategory), provider: provider.name };
    } catch (err) {
      const errStr = String(err);
      reasons.push(`${provider.name}: ${errStr.slice(0, 160)}`);
      // Keep the FIRST error per provider for the whole run: later ones are
      // usually the same cause, and the first is the one worth debugging.
      if (!health.errors[provider.name]) {
        health.errors[provider.name] = errStr.slice(0, 200);
      }
      const strikes = EXHAUSTED_PATTERN.test(errStr) ? (health.strikes[provider.name] ?? 0) + 1 : 0;
      health.strikes[provider.name] = strikes;
      const dead = DEAD_PROVIDER_PATTERN.test(errStr) || strikes >= EXHAUSTED_STRIKES;
      if (dead && !health.dead.includes(provider.name)) health.dead.push(provider.name);
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

/** Trim to at most `max` chars without splitting a word, adding an ellipsis only
 *  when something was actually removed. */
function clipAtWord(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, "")}...`;
}

function githubReposToFeedItems(repos: GitHubRepo[]): FeedItem[] {
  return repos.map((repo) => ({
    // Title: "repo-name, short description". The description is CLIPPED AT A WORD
    // BOUNDARY, which it previously was not: a flat .slice(0, 120) cut mid-word
    // and shipped titles like "...with OpenAI, Anthropic and Gemini co".
    //
    // 70 rather than 120 because the card gives the title no line limit and the
    // summary whatever is left, so an over-long title silently eats the summary.
    // Measured 2026-10-03: GitHub titles averaged 128 chars against 65-69 for
    // every other source, which is why GitHub cards were the worst-truncated.
    // The description is not lost, the summary already opens by restating it.
    title: repo.description ? `${repo.name} , ${clipAtWord(repo.description, 70)}` : repo.name,
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
const RUN_DEADLINE_MS = 600_000; // leave ~200s of the 800s ceiling for RSS/PH/GH fetch + PostHog flush

type IngestResults = {
  inserted: number;
  skipped: number;
  /** Items published before the feed window, dropped before the summariser. */
  stale: number;
  lowSignal: number;
  /** How many stories the quality gate rejected, broken down by why. A run that
   *  drops a lot of "off-topic" is either doing its job or the gate is eating
   *  real news, and the single lowSignal counter could not tell those apart. */
  rejectedByReason: Record<string, number>;
  /** The rejected stories themselves (capped), so the gate is auditable from one
   *  run instead of inferred from a shrinking feed. */
  rejected: { title: string; source: string; reason: RejectionReason; summary: string }[];
  /** Items dropped because the LLM call failed. Non-zero = ingestion is broken. */
  llmFailed: number;
  /** First provider error seen, verbatim — the thing you actually need to debug. */
  llmError: string | null;
  /** Which provider(s) produced summaries this run. */
  llmProviders: Record<string, number>;
  entitiesUpserted: number;
  mentionsLinked: number;
  /** Items returned per feed this run. 0 means the feed is dead, -1 means it threw. */
  feedItems: Record<string, number>;
  /** Failed-summary items kept in ingest_backlog for HERMES to retry. */
  backlogged: number;
  /** Items not yet attempted when the run hit its time budget; next run's source_url dedup picks them up. */
  deferred: number;
  /** Providers this run flagged dead (quota/auth/balance) and stopped calling for the rest of the run. */
  deadProviders: string[];
  errors: string[];
};

// mirrorToArchive / linkEntities now live in @/lib/news-ingest, used inside
// persistStory below.

// Best-effort: every LLM failure keeps the story in ingest_backlog instead of
// dropping it, so HERMES (see the Kapyn<->HERMES connection plan) can retry it
// with its own planner. Wrapped so a backlog write can never affect ingestion
// itself — only vercel_failures/last_error are bumped on a repeat failure for
// the same source_url; a row HERMES or a later run already resolved (status
// != 'pending') is left untouched.
async function backlogFailedStory(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  item: FeedItem,
  reason: string
): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from("ingest_backlog")
      .select("id, vercel_failures, status")
      .eq("source_url", item.sourceUrl)
      .maybeSingle();

    if (existing) {
      if (existing.status !== "pending") return false;
      const { error } = await supabase
        .from("ingest_backlog")
        .update({
          vercel_failures: existing.vercel_failures + 1,
          last_error: reason.slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      return !error;
    }

    const { error } = await supabase.from("ingest_backlog").insert({
      source_url: item.sourceUrl,
      title: item.title,
      source_name: item.sourceName,
      default_category: item.defaultCategory,
      content: item.content.slice(0, 2000),
      image_url: item.imageUrl,
      published_at: item.publishedAt,
      last_error: reason.slice(0, 500),
    });
    return !error;
  } catch {
    return false;
  }
}

async function insertItems(
  items: FeedItem[],
  supabase: ReturnType<typeof getSupabaseAdmin>,
  results: IngestResults,
  runStart: number,
  health: ProviderHealth
) {
  const withUrl = items.filter(i => i.title && i.sourceUrl);

  // Anything published before the feed window is deleted at the start of the next
  // run, so summarising it is wasted. RSS feeds carry months of archive (Import AI,
  // Interconnects, Transformer), and the URL dedup below only sees news_items, which
  // no longer holds them. So every run re-summarised the same expired articles,
  // inserted them, and the next run deleted them again: 79 of one run's 86 inserts
  // on 2026-10-16, some from April 2025, and most of the provider spend.
  // An unparseable date compares false and is kept.
  const cutoffMs = Date.parse(feedCutoffISO());
  const validItems = withUrl.filter(i => !(Date.parse(i.publishedAt) < cutoffMs));
  results.stale += withUrl.length - validItems.length;
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

  // Freshest stories first: if the run hits the deadline mid-way, new items win the
  // remaining time budget instead of losing to feed/array order.
  newItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // ── Process new items with bounded concurrency ────────────────────────────
  const processOne = async (item: FeedItem) => {
    const outcome = await classifyAndSummarize(item.title, item.content, item.defaultCategory, health);
    if (!outcome.ok) {
      results.llmFailed++;
      // Keep the first reason verbatim; the per-item lines stay terse so a
      // provider outage doesn't bury it under a hundred identical errors.
      if (!results.llmError) {
        results.llmError = outcome.reason;
        results.errors.push(`LLM failed , ${outcome.reason}`);
      }
      results.errors.push(`LLM failed for "${item.title}" , skipped`);
      if (await backlogFailedStory(supabase, item, outcome.reason)) {
        results.backlogged++;
      }
      return;
    }
    results.llmProviders[outcome.provider] = (results.llmProviders[outcome.provider] ?? 0) + 1;
    const { category, summary, entities } = outcome.value;
    const reason = rejectionReason(summary);
    if (reason) {
      results.lowSignal++;
      results.rejectedByReason[reason] = (results.rejectedByReason[reason] ?? 0) + 1;
      // Capped: a bad provider run can reject a hundred stories and the response
      // still has to be readable. The counts above stay complete either way.
      if (results.rejected.length < 60) {
        results.rejected.push({
          title: item.title.slice(0, 120),
          source: item.sourceName,
          reason,
          summary: summary.slice(0, 120),
        });
      }
      // Also to the Vercel log, so a rejection is greppable after the response
      // has scrolled away.
      console.warn(`[ingest] rejected (${reason}) ${item.sourceName}: ${item.title.slice(0, 100)}`);
      return;
    }

    const outcome2 = await persistStory(supabase, item, { category, summary, entities });
    if (!outcome2.ok) {
      results.errors.push(`Insert "${item.title}": ${outcome2.error}`);
      return;
    }
    results.inserted++;
    results.entitiesUpserted += outcome2.entitiesUpserted;
    results.mentionsLinked += outcome2.mentionsLinked;
    results.errors.push(...outcome2.errors);
  };

  for (let i = 0; i < newItems.length; i += INSERT_CONCURRENCY) {
    if (Date.now() - runStart >= RUN_DEADLINE_MS) {
      results.deferred += newItems.length - i;
      break;
    }
    await Promise.allSettled(newItems.slice(i, i + INSERT_CONCURRENCY).map(processOne));
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const runStart = Date.now();
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
              ? `Re-summary failed for "${item.title}" , ${r.reason}`
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
    inserted: 0, skipped: 0, stale: 0, lowSignal: 0,
    rejectedByReason: {}, rejected: [],
    llmFailed: 0, llmError: null, llmProviders: {},
    entitiesUpserted: 0, mentionsLinked: 0, feedItems: {}, backlogged: 0,
    deferred: 0, deadProviders: [], errors: [],
  };
  const health: ProviderHealth = {
    dead: results.deadProviders,
    strikes: {},
    errors: {},
    attempts: {},
    skipped: {},
  };

  // RSS feeds — parallel fetch
  const rssSettled = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchRSSFeed(feed))
  );

  for (let i = 0; i < rssSettled.length; i++) {
    const result = rssSettled[i];
    if (result.status === "fulfilled") {
      // A feed that parses but yields nothing is a dead feed wearing a healthy face.
      // Surfacing the count is what makes a silent 404-behind-a-redirect visible.
      results.feedItems[RSS_FEEDS[i].sourceName] = result.value.length;
      await insertItems(result.value, supabase, results, runStart, health);
    } else {
      results.feedItems[RSS_FEEDS[i].sourceName] = -1;
      results.errors.push(`RSS "${RSS_FEEDS[i].url}": ${String(result.reason)}`);
    }
  }

  const emptyFeeds = Object.entries(results.feedItems)
    .filter(([, n]) => n <= 0)
    .map(([name, n]) => (n < 0 ? `${name} (failed)` : `${name} (0 items)`));
  if (emptyFeeds.length) results.errors.push(`Empty feeds: ${emptyFeeds.join(", ")}`);

  // Product Hunt GraphQL
  try {
    const phPosts = await fetchProductHuntPosts(48);
    const phItems = phPostsToFeedItems(phPosts);
    await insertItems(phItems, supabase, results, runStart, health);
  } catch (err) {
    results.errors.push(`Product Hunt API: ${String(err)}`);
  }

  // GitHub trending — new AI/ML repos going viral in the last 48h
  try {
    const ghRepos = await fetchGitHubTrendingRepos(48);
    const ghItems = githubReposToFeedItems(ghRepos);
    await insertItems(ghItems, supabase, results, runStart, health);
  } catch (err) {
    results.errors.push(`GitHub API: ${String(err)}`);
  }

  // ── Health verdict ─────────────────────────────────────────────────────────
  // A run that inserts 100 and drops 46 exited 0 and emailed nobody, which is how
  // the pipeline stayed degraded for weeks while every run reported success. The
  // workflow gates on `health.status`, so "worked a bit" stops counting as worked.
  //
  // dropRate is measured against what actually reached the summariser. lowSignal
  // is excluded on purpose: OFF_TOPIC/LOW_SIGNAL is the filter doing its job, not
  // a failure, and folding it in would make a well-filtered run look broken.
  const attempted = results.inserted + results.llmFailed + results.lowSignal;
  const dropRate = attempted > 0 ? results.llmFailed / attempted : 0;
  const DEGRADED_AT = Number(process.env.INGEST_DROP_ALERT_RATE ?? 0.15);

  // "down" needs a failure, not just an empty run. The expired-article churn used to
  // guarantee inserts every run; without it, a quiet run whose few new items are all
  // off-topic inserts nothing, and that is the filter working, not an outage.
  const status: "ok" | "degraded" | "down" =
    results.llmFailed > 0 && results.inserted === 0 ? "down" : dropRate > DEGRADED_AT ? "degraded" : "ok";

  const health_report = {
    status,
    attempted,
    dropRate: Number(dropRate.toFixed(3)),
    degradedAt: DEGRADED_AT,
    /** Stories served, per provider. */
    providersUsed: results.llmProviders,
    /** Stories each provider was ASKED for. Attempts with no matching entry in
     *  providersUsed is the signature of a provider failing on every call. */
    providerAttempts: health.attempts,
    /** First error per provider, the thing deadProviders never told anyone. */
    providerErrors: health.errors,
    /** Configured in code but skipped for a missing env var. A provider in here
     *  is a deployment problem, not a provider problem. */
    providersSkipped: health.skipped,
    deadProviders: results.deadProviders,
    /** Why the quality gate rejected what it rejected. Watch "off-topic": the
     *  gate has known false positives (it called an OpenAI safety-team shakeup
     *  off-topic in testing), and this is the number that shows it happening. */
    rejectedByReason: results.rejectedByReason,
  };
  (results as Record<string, unknown>).health = health_report;

  // Track fetch completion server-side
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: "cron-job",
    event: "news_fetch_completed",
    properties: {
      inserted: results.inserted,
      skipped: results.skipped,
      stale: results.stale,
      low_signal: results.lowSignal,
      rejected_by_reason: JSON.stringify(results.rejectedByReason),
      llm_failed: results.llmFailed,
      llm_error: results.llmError,
      llm_providers: JSON.stringify(results.llmProviders),
      entities_upserted: results.entitiesUpserted,
      mentions_linked: results.mentionsLinked,
      backlogged: results.backlogged,
      deferred: results.deferred,
      dead_providers: JSON.stringify(results.deadProviders),
      health_status: status,
      drop_rate: Number(dropRate.toFixed(3)),
      attempted,
      provider_attempts: JSON.stringify(health.attempts),
      provider_errors: JSON.stringify(health.errors),
      providers_skipped: JSON.stringify(health.skipped),
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
