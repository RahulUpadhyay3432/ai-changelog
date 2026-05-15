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

const parser = new Parser({ timeout: 10000 });

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function summarize(title: string, content: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-coder:free",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Summarize this AI news article in EXACTLY 60 words. Be precise and informative. No filler. Output only the summary, nothing else.\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

async function fetchFeed(feed: (typeof RSS_FEEDS)[0]): Promise<
  {
    title: string;
    sourceUrl: string;
    sourceName: string;
    category: string;
    content: string;
    publishedAt: string;
  }[]
> {
  const parsed = await parser.parseURL(feed.url);
  return (parsed.items ?? []).slice(0, 10).map((item) => ({
    title: item.title ?? "",
    sourceUrl: item.link ?? item.guid ?? "",
    sourceName: feed.sourceName,
    category: feed.category,
    content: item.contentSnippet ?? item.content ?? item.summary ?? item.title ?? "",
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
  }));
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const results = { inserted: 0, skipped: 0, errors: [] as string[] };

  for (const feed of RSS_FEEDS) {
    let items: Awaited<ReturnType<typeof fetchFeed>> = [];
    try {
      items = await fetchFeed(feed);
    } catch (err) {
      results.errors.push(`Feed ${feed.url}: ${String(err)}`);
      continue;
    }

    for (const item of items) {
      if (!item.title || !item.sourceUrl) continue;

      // Check duplicate
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
