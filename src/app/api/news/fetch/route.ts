import type { NextRequest } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

const RSS_FEEDS: { url: string; category: string; sourceName: string }[] = [
  { url: "https://blog.google/technology/ai/rss/", category: "ai-models", sourceName: "Google AI Blog" },
  { url: "https://openai.com/blog/rss.xml", category: "ai-models", sourceName: "OpenAI Blog" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "research", sourceName: "TechCrunch AI" },
  { url: "https://huggingface.co/blog/feed.xml", category: "open-source", sourceName: "Hugging Face" },
  { url: "https://venturebeat.com/category/ai/feed/", category: "research", sourceName: "VentureBeat AI" },
  { url: "https://the-decoder.com/feed/", category: "ai-models", sourceName: "The Decoder" },
  { url: "https://www.producthunt.com/feed", category: "producthunt", sourceName: "Product Hunt" },
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

function isBadSummary(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    t.startsWith("write a ") ||
    t.startsWith("the provided content") ||
    t.includes("summarize this article")
  );
}

function buildPrompt(title: string, content: string): string {
  if (content.startsWith("Write a 40-80 word summary")) return content;
  return `Summarize this article in 40-80 words. Be specific and informative.\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`;
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

async function summarize(title: string, content: string): Promise<string> {
  const prompt = buildPrompt(title, content);
  try {
    return await summarizeGemini(prompt);
  } catch {
    try {
      return await summarizeOpenRouter(prompt);
    } catch {
      // If content is a prompt string (not real article text), fall back to title
      const fallback = content.startsWith("Write a ") ? title : content;
      return fallback.split(/\s+/).filter(Boolean).slice(0, 60).join(" ");
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

async function fetchFeed(feed: (typeof RSS_FEEDS)[0]): Promise<FeedItem[]> {
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

  const isPH = feed.sourceName === "Product Hunt";

  return rawItems.map((item, i) => {
    const meta = metaResults[i].status === "fulfilled" ? metaResults[i].value : { imageUrl: null, description: null, title: null };
    return {
      ...item,
      imageUrl: meta.imageUrl ?? item.imageUrl,
      directSummary: isPH && meta.description ? meta.description : null,
    };
  });
}


async function insertItems(
  items: FeedItem[],
  supabase: ReturnType<typeof getSupabaseAdmin>,
  results: { inserted: number; skipped: number; errors: string[] }
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

    let summary = "";
    if (item.directSummary) {
      const wordCount = item.directSummary.split(/\s+/).filter(Boolean).length;
      summary = wordCount <= 80
        ? item.directSummary
        : await summarize(item.title, item.directSummary);
    } else {
      const aiContent = item.content.length < 50 && item.sourceName === "Product Hunt"
        ? `Write a 40-80 word summary about this product: ${item.title}`
        : item.content;
      try {
        summary = await summarize(item.title, aiContent);
      } catch (err) {
        results.errors.push(`Summarize "${item.title}": ${String(err)}`);
        summary = item.content.split(/\s+/).filter(Boolean).slice(0, 60).join(" ");
      }
    }

    if (isBadSummary(summary)) {
      results.errors.push(`Bad summary skipped for "${item.title}"`);
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

  // Re-summarize mode: fix existing items with short summaries
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

    const totalShort = (items ?? []).filter((i: { summary: string }) => i.summary.trim().split(/\s+/).filter(Boolean).length < 45).length;
    const results = { updated: 0, errors: [] as string[], remaining: Math.max(0, totalShort - offsetParam - limitParam) };

    for (let i = 0; i < short.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 10000));
      const item = short[i];
      try {
        const newSummary = await summarize(item.title, item.title);
        if (isBadSummary(newSummary)) {
          results.errors.push(`Bad re-summary skipped for "${item.title}"`);
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

  // Normal fetch mode

  // Clean up leaked prompt text saved as summaries
  await supabase.from("news_items").delete().ilike("summary", "Write a 40%");
  await supabase.from("news_items").delete().ilike("summary", "The provided content%");
  await supabase.from("news_items").delete().ilike("summary", "%summarize this article%");

  // Remove stale items older than 48h
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await supabase.from("news_items").delete().lt("published_at", cutoff);

  const results = { inserted: 0, skipped: 0, errors: [] as string[] };

  // Fetch RSS feeds
  for (const feed of RSS_FEEDS) {
    let items: FeedItem[] = [];
    try {
      items = await fetchFeed(feed);
    } catch (err) {
      results.errors.push(`Feed ${feed.url}: ${String(err)}`);
      continue;
    }
    await insertItems(items, supabase, results);
  }

  return Response.json(results);
}
