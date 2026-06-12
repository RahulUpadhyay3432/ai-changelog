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

export const runtime = "nodejs";
export const maxDuration = 300;

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
  { url: "https://blogs.microsoft.com/ai/feed/",                          defaultCategory: "big-tech",       sourceName: "Microsoft AI" },
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
  { url: "https://www.theregister.com/headlines/ai.atom",                  defaultCategory: "ai-models",      sourceName: "The Register" },
  { url: "https://changelog.com/news/feed",                                defaultCategory: "open-source",    sourceName: "Changelog" },
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

type PageMeta = { imageUrl: string | null; description: string | null; title: string | null };

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function extractMeta(html: string, property: string, nameAttr = "property"): string | null {
  return (
    html.match(new RegExp(`<meta[^>]+${nameAttr}=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${nameAttr}=["']${property}["']`, "i"))?.[1] ??
    null
  );
}

async function fetchPageMeta(url: string): Promise<PageMeta> {
  if (!url) return { imageUrl: null, description: null, title: null };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
    });
    clearTimeout(timer);
    if (!res.ok) return { imageUrl: null, description: null, title: null };
    const reader = res.body?.getReader();
    if (!reader) return { imageUrl: null, description: null, title: null };
    const decoder = new TextDecoder();
    let html = "";
    try {
      while (html.length < 51200) {
        const { value, done } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.cancel();
    }
    const rawImageUrl =
      extractMeta(html, "og:image") ??
      extractMeta(html, "og:image:secure_url") ??
      extractMeta(html, "twitter:image", "name") ??
      extractMeta(html, "twitter:image:src", "name") ??
      null;
    // Resolve relative URLs to absolute
    let imageUrl: string | null = null;
    if (rawImageUrl) {
      try {
        imageUrl = new URL(rawImageUrl, url).href;
      } catch {
        imageUrl = rawImageUrl.startsWith("http") ? rawImageUrl : null;
      }
    }
    const description =
      extractMeta(html, "og:description") ?? extractMeta(html, "twitter:description", "name") ?? null;
    const titleRaw =
      extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title", "name") ?? null;
    return {
      imageUrl,
      description: description ? decodeHTMLEntities(description) : null,
      title: titleRaw ? decodeHTMLEntities(titleRaw) : null,
    };
  } catch {
    return { imageUrl: null, description: null, title: null };
  }
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
- If the content is NOT about AI, ML, software, developer tools, tech startups, or the tech industry: write OFF_TOPIC

Respond in EXACTLY this format — no extra text before or after:
CATEGORY: <slug>
SUMMARY: <2-3 sentences or LOW_SIGNAL>

Title: ${title}
Content: ${content.slice(0, 2000)}`;
}

interface ClassifyResult {
  category: CategorySlug;
  summary: string; // "LOW_SIGNAL" triggers isBadSummary
}

function parseClassifyResponse(text: string, fallback: CategorySlug): ClassifyResult {
  const categoryMatch = text.match(/^CATEGORY:\s*(\S+)/m);
  const summaryMatch = text.match(/^SUMMARY:\s*([\s\S]+)/m);

  const rawSlug = categoryMatch?.[1]?.trim() ?? "";
  const category: CategorySlug = VALID_SLUGS.includes(rawSlug as CategorySlug)
    ? (rawSlug as CategorySlug)
    : fallback;

  const summary = summaryMatch?.[1]?.trim() ?? "";
  return { category, summary };
}

/**
 * Detects summaries that must never reach the feed.
 * Catches both exact sentinels (LOW_SIGNAL, OFF_TOPIC) and the prose
 * variations the LLM sometimes writes instead of the sentinel word.
 */
function isBadSummary(text: string): boolean {
  const t = text.trim();
  const lower = t.toLowerCase();
  return (
    // Exact sentinels
    t === "LOW_SIGNAL" ||
    lower.startsWith("low_signal") ||
    t === "OFF_TOPIC" ||
    lower.startsWith("off_topic") ||
    // Prose off-topic: LLM writes "This content is not related to AI..."
    // instead of the OFF_TOPIC sentinel
    lower.includes("not related to ai") ||
    lower.includes("not related to ml") ||
    lower.includes("not related to software") ||
    lower.includes("not related to tech") ||
    lower.includes("this content is not") ||
    lower.includes("not about ai") ||
    lower.includes("not about tech") ||
    // Prompt-forbidden openers — when the LLM uses these it signals generic
    // or off-topic content (the prompt explicitly bans them for real stories)
    lower.startsWith("this article") ||
    lower.startsWith("this post") ||
    lower.startsWith("this blog") ||
    // Leaked prompt / boilerplate
    lower.startsWith("write a ") ||
    lower.startsWith("the provided content") ||
    lower.includes("summarize this article") ||
    /^release:\s/i.test(t) ||
    /\btags:\s*[\w,\s]+$/.test(t) ||
    /refs\s+\S+#\d+/i.test(t) ||
    /^v?\d+\.\d+[\w.]*\s*[-–]\s*/i.test(t)
  );
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
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

const OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";

async function callOpenRouter(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      // Nemotron is a reasoning model — headroom for hidden reasoning tokens
      // plus the answer, or `content` comes back empty.
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("OpenRouter returned empty response");
  return text;
}

/**
 * Single LLM call that returns both the correct category and a clean summary.
 * Falls back to OpenRouter if Gemini fails.
 * Returns null if both fail — callers must skip the item.
 */
async function classifyAndSummarize(
  title: string,
  content: string,
  defaultCategory: CategorySlug
): Promise<ClassifyResult | null> {
  const prompt = buildClassifyAndSummarizePrompt(title, content, defaultCategory);
  // Primary: OpenRouter (Nemotron). Fallback: Gemini.
  try {
    const raw = await callOpenRouter(prompt);
    return parseClassifyResponse(raw, defaultCategory);
  } catch {
    try {
      const raw = await callGemini(prompt);
      return parseClassifyResponse(raw, defaultCategory);
    } catch {
      return null; // Both failed — skip item, never show raw content
    }
  }
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

const INSERT_CONCURRENCY = 4; // parallel LLM calls — stays within Gemini free quota

async function insertItems(
  items: FeedItem[],
  supabase: ReturnType<typeof getSupabaseAdmin>,
  results: { inserted: number; skipped: number; lowSignal: number; errors: string[] }
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
    const result = await classifyAndSummarize(item.title, item.content, item.defaultCategory);
    if (result === null) {
      results.errors.push(`LLM failed for "${item.title}" — skipped`);
      return;
    }
    const { category, summary } = result;
    if (isBadSummary(summary)) { results.lowSignal++; return; }

    const { error } = await supabase.from("news_items").insert({
      title: item.title,
      summary,
      source_url: item.sourceUrl,
      source_name: item.sourceName,
      category_slug: category,
      published_at: item.publishedAt,
      image_url: item.imageUrl,
    });
    if (error) results.errors.push(`Insert "${item.title}": ${error.message}`);
    else results.inserted++;
  };

  for (let i = 0; i < newItems.length; i += INSERT_CONCURRENCY) {
    await Promise.allSettled(newItems.slice(i, i + INSERT_CONCURRENCY).map(processOne));
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const secret =
    request.headers.get("x-cron-secret") ??
    request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
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
        if (r === null || isBadSummary(r.summary)) {
          results.errors.push(`Bad/failed re-summary skipped for "${item.title}"`);
          continue;
        }
        const { error } = await supabase
          .from("news_items")
          .update({ summary: r.summary, category_slug: r.category })
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

  // Remove stale items older than 48h
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await supabase.from("news_items").delete().lt("published_at", cutoff);

  // Idempotent slug migrations (runs harmlessly after first pass)
  await supabase.from("news_items").update({ category_slug: "dev-tools"  }).eq("category_slug", "tools");
  await supabase.from("news_items").update({ category_slug: "funding-ma" }).eq("category_slug", "funding");
  await supabase.from("news_items").update({ category_slug: "startups"   }).eq("category_slug", "producthunt");

  const results = { inserted: 0, skipped: 0, lowSignal: 0, errors: [] as string[] };

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
