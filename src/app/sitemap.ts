import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "@/lib/categories";
import { BLOG_POSTS } from "@/lib/blog-content";
import { MCP_SERVERS } from "@/lib/radar-mcp";
import { AI_SKILLS } from "@/lib/radar-skills";
import { MODEL_PAIRS, pairSlug } from "@/lib/model-pairs";
import { getAllTools } from "@/lib/tools-registry";
import { getPromotedToolPages } from "@/lib/promoted-tools";
import { slugify } from "@/lib/entities";

export const dynamic = "force-dynamic";

const APP_URL = "https://kapyn.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  // Stories come from the DURABLE archive, not news_items — the old sitemap read
  // news_items and silently shrank every 48h as stories were deleted.
  const { data: stories } = await supabase
    .from("story_archive")
    .select("id, published_at")
    .order("published_at", { ascending: false })
    .limit(5000);

  const storyUrls: MetadataRoute.Sitemap = (stories ?? []).map((s) => ({
    url: `${APP_URL}/story/${s.id}`,
    lastModified: new Date(s.published_at),
    changeFrequency: "never" as const,
    priority: 0.6,
  }));

  // Concept/technique pages with a PUBLISHED explainer (the only indexable ones).
  // M1 ships /learn only, so the sitemap is scoped to learn-types; M2 adds /tools.
  const { data: published } = await supabase
    .from("entity_explainers")
    .select("entity_id, updated_at")
    .eq("status", "published")
    .limit(5000);

  const updatedById = new Map<string, string>();
  for (const row of (published ?? []) as { entity_id: string; updated_at: string }[]) {
    updatedById.set(row.entity_id, row.updated_at);
  }

  let learnUrls: MetadataRoute.Sitemap = [];
  if (updatedById.size > 0) {
    const { data: ents } = await supabase
      .from("entities")
      .select("id, slug, mention_count")
      .in("id", Array.from(updatedById.keys()))
      .in("entity_type", ["technique", "concept"])
      .eq("status", "active");

    learnUrls = ((ents ?? []) as { id: string; slug: string; mention_count: number }[]).map((e) => ({
      url: `${APP_URL}/learn/${e.slug}`,
      lastModified: new Date(updatedById.get(e.id) ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: Math.min(0.9, 0.6 + Math.min(e.mention_count, 6) * 0.05),
    }));
  }

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${APP_URL}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const promotedToolUrls: MetadataRoute.Sitemap = (await getPromotedToolPages()).map((t) => ({
    url: `${APP_URL}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${APP_URL}/blog/${p.slug}`,
    // `updated` is the whole point of refreshing an evergreen hub. Reading only `date` here
    // meant a refresh moved dateModified in the JSON-LD but never the sitemap's lastmod.
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${APP_URL}/home`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...blogUrls,
    { url: `${APP_URL}/radar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/radar/pulse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${APP_URL}/mcp`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/mcp/config`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...MCP_SERVERS.map((s) => ({
      url: `${APP_URL}/mcp/${slugify(s.name)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${APP_URL}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/skills`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...[...new Set(AI_SKILLS.map((s) => slugify(s.name)))].map((slug) => ({
      url: `${APP_URL}/skills/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${APP_URL}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    // Discovered tools that cleared the promotion gate. This is the half of the
    // catalog search engines could not previously see.
    ...promotedToolUrls,
    { url: `${APP_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // Only tools with enough curated peers get an alternatives page — mirrors
    // the MIN_ALTERNATIVES guard on the route so the sitemap never lists a 404.
    ...getAllTools()
      .filter((tl, _i, arr) => arr.filter((o) => o.category === tl.category).length - 1 >= 3)
      .map((tl) => ({
        url: `${APP_URL}/tools/${tl.slug}/alternatives`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...MODEL_PAIRS.map((pr) => ({
      url: `${APP_URL}/compare/${pairSlug(pr)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${APP_URL}/trending`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.5 },
    { url: `${APP_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: `${APP_URL}/okf`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    { url: `${APP_URL}/okf/stories`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    { url: `${APP_URL}/okf/tools`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    ...categoryUrls,
    ...learnUrls,
    ...storyUrls,
  ];
}
