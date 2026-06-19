import { createClient } from "@supabase/supabase-js";
import { getRadarCards, getRadarTools, getRadarEssentials } from "@/lib/knowledge";

export const revalidate = 3600;

const APP_URL = "https://kapyn.app";

interface CategoryRow {
  category_slug: string;
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

  const [storiesResult, tools, entities, essentials] = await Promise.all([
    supabase
      .from("news_items")
      .select("category_slug")
      .gte("published_at", cutoff)
      .limit(200),
    getRadarTools(20),
    getRadarCards(21, 2, 20),
    getRadarEssentials(20),
  ]);

  const stories = (storiesResult.data ?? []) as CategoryRow[];
  const storyCount = stories.length;
  const toolCount = tools.length + entities.length + essentials.length;

  const byCat: Record<string, number> = {};
  for (const s of stories) {
    byCat[s.category_slug] = (byCat[s.category_slug] ?? 0) + 1;
  }

  const categoryLines = Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .map(([slug, count]) => `  * ${slug}: ${count}`)
    .join("\n");

  const md = `---
type: Knowledge Bundle Index
title: Kapyn — AI & Tech Intelligence Catalog
description: Daily structured digest of AI/tech news and tool tracking, updated hourly
resource: ${APP_URL}
tags: [ai, tech, news, radar, tools, daily-digest, open-knowledge-format]
timestamp: ${now}
---

# Kapyn Knowledge Catalog

Kapyn tracks what matters in AI and tech — distilled to 30-second reads.
This OKF bundle exposes the structured content behind the feed for AI agents,
search crawlers, and downstream integrations.

Updated hourly. No paywall. No hype.

# Sections

* [Today's Stories](/okf/stories) — ${storyCount} stories in the last 48h
* [AI Tools Radar](/okf/tools) — ${toolCount} tools, models, and entities tracked

# Today at a Glance (${today})

Stories by category:
${categoryLines || "  * No stories yet today"}

Radar coverage:
  * ${tools.length} trending tools (GitHub + Product Hunt)
  * ${entities.length} active AI entities
  * ${essentials.length} essential tools

# About

Kapyn is a mobile-first app delivering AI/tech news as swipeable 30-second dispatches.
Built for engineers, founders, and operators who need to stay current without the noise.

* App: ${APP_URL}
* Radar: ${APP_URL}/radar
* Stories: ${APP_URL}/okf/stories
* Tools: ${APP_URL}/okf/tools
* llms.txt: ${APP_URL}/llms.txt
`;

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
