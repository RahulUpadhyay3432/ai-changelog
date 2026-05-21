import type { NextRequest } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import {
  fetchProductHuntPosts,
  buildPHSummary,
  type PHFeedItem,
} from "@/lib/producthunt";

export const runtime = "nodejs";
export const maxDuration = 300;

// Product Hunt removed — now uses GraphQL API (src/lib/producthunt.ts)
const RSS_FEEDS: { url: string; category: string; sourceName: string }[] = [
  { url: "https://blog.google/technology/ai/rss/", category: "ai-models", sourceName: "Google AI Blog" },
  { url: "https://openai.com/blog/rss.xml", category: "ai-models", sourceName: "OpenAI Blog" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "research", sourceName: "TechCrunch AI" },
  { url: "https://huggingface.co/blog/feed.xml", category: "open-source", sourceName: "Hugging Face" },
  { url: "https://venturebeat.com/category/ai/feed/", category: "research", sourceName: "VentureBeat AI" },
  { url: "https://the-decoder.com/feed/", category: "ai-models", sourceName: "The Decoder" },
  { url: "https://simonwillison.net/atom/everything/", category: "tools", sourceName: "Simon Willison" },
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
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    const imageUrl =
      extractMeta(html, "og:image") ??
      extractMeta(html, "twitter:image", "name") ??
      null;

    const description =
      extractMeta(html, "og:description") ??
      extractMeta(html, "twitter:description", "name") ??
      null;

    const titleRaw =
      extractMeta(html, "og:title") ??
      extractMeta(html, "twitter:title", "name") ??
      null;

    return {
      imageUrl,
      description: description ? decodeHTMLEntities(description) : null,
      title: titleRaw ? decodeHTMLEntities(titleRaw) : null,
    };
  } catch {
    return { imageUrl: null, description: null, title: null };
  }
}

/**
 * Detects summaries that should never reach the feed:
 * - LOW_SIGNAL flag from the AI editor
 * - Leaked prompt strings
 * - Raw release note patterns that slipped through
 */
function isBadSummary(text: string): boolean {
  const t = text.trim();
  const lower = t.toLowerCase();
  return (
    t === "LOW_SIGNAL" ||
    lower.startsWith("low_signal") ||
    lower.startsWith("write a ") ||
    lower.startsWith("the provided content") ||
    lower.includes("summarize this article") ||
    // Raw release note leak patterns
    /^release:\s/i.test(t) ||
    /\btags:\s*[\w,\s]+$/.test(t) ||
    /refs\s+\S+#\d+/i.test(t) ||
    /^v?\d+\.\d+[\w.]*\s*[-–]\s*/i.test(t)
  );
}

/**
 * Premium tech editor prompt.
 * Instructs the AI to write a contextual dispatch — not paraphrase raw notes.
 * Returns exactly "LOW_SIGNAL" for minor patches with no user-facing changes.
 */
function buildEditorPrompt(title: string, content: string): string {
  return `You are a tech editor for "AI Changelog", a premium intelligence feed for AI developers and enthusiasts.

Given the title and raw content below, write a 2-3 sentence dispatch that:
(a) explains what this tool or library does in plain English (assume the reader hasn't heard of it)
(b) describes what changed or was announced
(c) explains why it matters to an AI developer or enthusiast

Rules:
- NEVER echo raw commit messages, issue references (#7, refs #123), tag lists, or version metadata
- NEVER start with "This article", "This release", "This post", or the product name alone
- Write in present tense, active voice
- If this update has NO meaningful user-facing changes (pure dependency bump, typo fix, internal refactor, test changes only) — respond with exactly: LOW_SIGNAL

Title: ${title}

Content: ${content.slice(0, 2000)}`;
}

async function summarizeGemini(prompt: string): Promise<string> {
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

async function summarizeOpenRouter(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite:free",
      max_tokens: 200,
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
 * Returns null if both LLMs fail — callers must skip the item.
 * Never falls back to raw content (that's what caused the bug).
 */
async function summarize(title: string, content: string): Promise<string | null> {
  const prompt = buildEditorPrompt(title, content);
  try {
    return await summarizeGemini(prompt);
  } catch {
    try {
      return await summarizeOpenRouter(prompt);
    } catch {
      // Both failed — do NOT return raw content. Skip the item instead.
      return null;
    }
  }
}

type FeedItem = {
  title: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  content: string;
  publishedAt: string;
  imageUrl: string | null;
  directSummary: string | null;
};

async function fetchRSSFeed(feed: (typeof RSS_FEEDS)[0]): Promise<FeedItem[]> {
  const parsed = await parser.parseURL(feed.url);

  const rawItems = (parsed.items ?? []).slice(0, 10).map((item) => {
    const rawContent = item.contentSnippet ?? item.content ?? item.summary ?? item.description ?? "";
    const trimmed = rawContent.trim();
    const content = trimmed || (item.title ?? "");
    return {
      title: item.title ?? "",
      sourceUrl: item.link ?? item.guid ?? "",
      sourceName: feed.sourceName,
      category: feed.category,
      content,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      imageUrl: extractImageUrl(item),
      directSummary: null as string | null,
    };
  });

  const metaResults = await Promise.allSettled(
    rawItems.map((item) => fetchPageMeta(item.sourceUrl))
  );

  return rawItems.map((item, i) => {
    const meta = metaResults[i].status === "fulfilled"
      ? metaResults[i].value
      : { imageUrl: null, description: null, title: null };
    return {
      ...item,
      imageUrl: meta.imageUrl ?? item.imageUrl,
      directSummary: null,
    };
  });
}

/**
 * Convert PHFeedItem[] → FeedItem[] for the shared insert pipeline.
 * Uses tagline + description as directSummary — no scraping needed.
 */
function phPostsToFeedItems(posts: PHFeedItem[]): FeedItem[] {
  return posts.map((post) => {
    const rawSummary = buildPHSummary(post);
    const wordCount = rawSummary.split(/\s+/).filter(Boolean).length;

    return {
      title: post.title,
      sourceUrl: post.sourceUrl,
      sourceName: "Product Hunt",
      category: "producthunt",
      // content is only used as fallback when directSummary is null
      content: post.tagline,
      publishedAt: post.publishedAt,
      imageUrl: post.imageUrl,
      // If ≤80 words: use as-is (no LLM call). If longer: let summarize() trim it.
      directSummary: wordCount <= 80 ? rawSummary : rawSummary,
    };
  });
}

async function insertItems(
  items: FeedItem[],
  supabase: ReturnType<typeof getSupabaseAdmin>,
  results: { inserted: number; skipped: number; lowSignal: number; errors: string[] }
) {
  for (const item of items) {
    if (!item.title || !item.sourceUrl) continue;

    const { data: existing } = await supabase
      .from("news_items")
      .select("id")
      .eq("source_url", item.sourceUrl)
      .maybeSingle();

    if (existing) {
      results.skipped++;
      continue;
    }

    let summary: string | null = null;

    if (item.directSummary) {
      // PH / pre-structured content: use directly if short, else run editor pass
      const wordCount = item.directSummary.split(/\s+/).filter(Boolean).length;
      summary = wordCount <= 80
        ? item.directSummary
        : await summarize(item.title, item.directSummary);
    } else {
      summary = await summarize(item.title, item.content);
    }

    // null = both LLMs failed → skip, do not store raw content
    if (summary === null) {
      results.errors.push(`Summarization failed (both LLMs) for "${item.title}" — skipped`);
      continue;
    }

    // LOW_SIGNAL or leaked raw text → filter from feed
    if (isBadSummary(summary)) {
      results.lowSignal++;
      continue;
    }

    const { error } = await supabase.from("news_items").insert({
      title: item.title,
      summary,
      source_url: item.sourceUrl,
      source_name: item.sourceName,
      category_slug: item.category,
      published_at: item.publishedAt,
      image_url: item.imageUrl,
    });

    if (error) {
      results.errors.push(`Insert "${item.title}": ${error.message}`);
    } else {
      results.inserted++;
    }
  }
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get("mode");
  const supabase = getSupabaseAdmin();

  // Re-summarize mode
  if (mode === "resummary") {
    const limitParam = parseInt(request.nextUrl.searchParams.get("limit") ?? "30", 10);
    const offsetParam = parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10);

    const { data: items } = await supabase
      .from("news_items")
      .select("id, title, summary")
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
        const newSummary = await summarize(item.title, item.title);
        if (newSummary === null || isBadSummary(newSummary)) {
          results.errors.push(`Bad/failed re-summary skipped for "${item.title}"`);
          continue;
        }
        const { error } = await supabase
          .from("news_items")
          .update({ summary: newSummary })
          .eq("id", item.id);
        if (error) results.errors.push(`Update ${item.id}: ${error.message}`);
        else results.updated++;
      } catch (err) {
        results.errors.push(`Summarize "${item.title}": ${String(err)}`);
      }
    }

    return Response.json(results);
  }

  // ── Normal fetch ──────────────────────────────────────────────────────────

  // Clean up leaked prompt strings saved as summaries
  await supabase.from("news_items").delete().ilike("summary", "Write a 40%");
  await supabase.from("news_items").delete().ilike("summary", "The provided content%");
  await supabase.from("news_items").delete().ilike("summary", "%summarize this article%");

  // Remove stale items older than 48h
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await supabase.from("news_items").delete().lt("published_at", cutoff);

  const results = { inserted: 0, skipped: 0, lowSignal: 0, errors: [] as string[] };

  // ── RSS feeds (parallel) ─────────────────────────────────────────────────
  const rssSettled = await Promise.allSettled(RSS_FEEDS.map((feed) => fetchRSSFeed(feed)));

  for (let i = 0; i < rssSettled.length; i++) {
    const result = rssSettled[i];
    if (result.status === "fulfilled") {
      await insertItems(result.value, supabase, results);
    } else {
      results.errors.push(`RSS feed "${RSS_FEEDS[i].url}": ${String(result.reason)}`);
    }
  }

  // ── Product Hunt GraphQL API ─────────────────────────────────────────────
  try {
    const phPosts = await fetchProductHuntPosts(48);
    const phItems = phPostsToFeedItems(phPosts);
    await insertItems(phItems, supabase, results);
  } catch (err) {
    results.errors.push(`Product Hunt API: ${String(err)}`);
  }

  return Response.json(results);
}
