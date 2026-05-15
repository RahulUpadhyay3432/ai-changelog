import type { NextRequest } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

const RSS_FEEDS: { url: string; category: string; sourceName: string }[] = [
  { url: "https://blog.google/technology/ai/rss/", category: "ai-models", sourceName: "Google AI Blog" },
  { url: "https://openai.com/blog/rss.xml", category: "ai-models", sourceName: "OpenAI Blog" },
  { url: "https://www.anthropic.com/rss.xml", category: "tools", sourceName: "Anthropic" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "research", sourceName: "TechCrunch AI" },
  { url: "https://huggingface.co/blog/feed.xml", category: "open-source", sourceName: "Hugging Face" },
  { url: "https://venturebeat.com/category/ai/feed/", category: "research", sourceName: "VentureBeat AI" },
  { url: "https://the-decoder.com/feed/", category: "ai-models", sourceName: "The Decoder" },
  { url: "https://www.producthunt.com/feed", category: "producthunt", sourceName: "Product Hunt" },
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
  // media:content
  const mc = item.mediaContent ?? item["media:content"];
  if (mc && typeof mc === "object" && (mc as { $?: { url?: string } }).$?.url) {
    return (mc as { $: { url: string } }).$.url;
  }

  // media:thumbnail
  const mt = item.mediaThumbnail ?? item["media:thumbnail"];
  if (mt && typeof mt === "object" && (mt as { $?: { url?: string } }).$?.url) {
    return (mt as { $: { url: string } }).$.url;
  }

  // enclosure
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }

  // <img> tag inside description / content
  const html = (item.description ?? item.content ?? "") as string;
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (m) return m[1];

  return null;
}

async function fetchOgImage(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    // Read only first 50KB — meta tags are always in <head>
    const reader = res.body?.getReader();
    if (!reader) return null;
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

    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og?.[1]) return og[1];

    const tw =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (tw?.[1]) return tw[1];

    return null;
  } catch {
    return null;
  }
}

async function summarize(title: string, content: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Summarize this article in 40-80 words. Be specific and informative.\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`,
            },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
}

type FeedItem = {
  title: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  content: string;
  publishedAt: string;
  imageUrl: string | null;
};

async function fetchFeed(feed: (typeof RSS_FEEDS)[0]): Promise<FeedItem[]> {
  const parsed = await parser.parseURL(feed.url);
  const rawItems = (parsed.items ?? []).slice(0, 10).map((item) => {
    const rawContent = item.contentSnippet ?? item.content ?? item.summary ?? item.description ?? "";
    const content = rawContent.trim() || (item.title ?? "");
    return {
      title: item.title ?? "",
      sourceUrl: item.link ?? item.guid ?? "",
      sourceName: feed.sourceName,
      category: feed.category,
      content,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      imageUrl: extractImageUrl(item),
    };
  });

  // Fetch OG images for all items in parallel (5s timeout each)
  const ogResults = await Promise.allSettled(
    rawItems.map((item) => fetchOgImage(item.sourceUrl))
  );

  return rawItems.map((item, i) => ({
    ...item,
    imageUrl:
      (ogResults[i].status === "fulfilled" ? ogResults[i].value : null) ??
      item.imageUrl,
  }));
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
      // Wait before every call except the first (8 RPM free tier = 7.5s; use 10s for safety)
      if (i > 0) await new Promise((r) => setTimeout(r, 10000));
      const item = short[i];
      try {
        const newSummary = await summarize(item.title, item.title);
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
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await supabase.from("news_items").delete().lt("published_at", cutoff);

  const results = { inserted: 0, skipped: 0, errors: [] as string[] };

  for (const feed of RSS_FEEDS) {
    let items: FeedItem[] = [];
    try {
      items = await fetchFeed(feed);
    } catch (err) {
      results.errors.push(`Feed ${feed.url}: ${String(err)}`);
      continue;
    }

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
      try {
        summary = await summarize(item.title, item.content);
      } catch (err) {
        results.errors.push(`Summarize "${item.title}": ${String(err)}`);
        summary = item.content.slice(0, 300);
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

  return Response.json(results);
}
