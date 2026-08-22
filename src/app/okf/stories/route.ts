import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const APP_URL = "https://kapyn.app";

const CATEGORY_NAMES: Record<string, string> = {
  "ai-models": "AI Models",
  "dev-tools": "Dev Tools",
  "open-source": "Open Source",
  startups: "Startups",
  research: "Research",
  "funding-ma": "Funding & M&A",
  "big-tech": "Big Tech",
  infrastructure: "Infrastructure",
  policy: "Policy & Regulation",
};

interface StoryRow {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category_slug: string;
  published_at: string;
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const { data } = await supabase
    .from("news_items")
    .select("id, title, summary, source_url, source_name, category_slug, published_at")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(100);

  const stories = (data ?? []) as StoryRow[];

  // Group by category, sorted by story count descending
  const byCat: Record<string, StoryRow[]> = {};
  for (const s of stories) {
    if (!byCat[s.category_slug]) byCat[s.category_slug] = [];
    byCat[s.category_slug].push(s);
  }
  const sortedCats = Object.keys(byCat).sort(
    (a, b) => byCat[b].length - byCat[a].length
  );

  let sections = "";
  for (const slug of sortedCats) {
    const name = CATEGORY_NAMES[slug] ?? slug;
    sections += `\n## ${name}\n\n`;
    for (const s of byCat[slug]) {
      sections += `### ${s.title}\n\n`;
      sections += `* **source:** ${s.source_name}\n`;
      sections += `* **category:** ${slug}\n`;
      sections += `* **published:** ${s.published_at}\n`;
      sections += `* **url:** ${s.source_url}\n`;
      sections += `* **story-page:** ${APP_URL}/story/${s.id}\n\n`;
      sections += `${s.summary}\n\n---\n\n`;
    }
  }

  const allTags = [...new Set(stories.map((s) => s.category_slug))];

  const md = `---
type: AI News Digest
title: Kapyn AI & Tech News, ${today}
description: ${stories.length} stories from the last 48 hours, grouped by category
resource: ${APP_URL}
tags: [${allTags.join(", ")}]
timestamp: ${now}
---

# Kapyn News Digest , ${today}

${stories.length} stories from the last 48 hours, grouped by category.
Published by Kapyn (${APP_URL}) , AI/tech news distilled to 30-second reads.

[← Back to catalog](/okf)
${sections}`;

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
