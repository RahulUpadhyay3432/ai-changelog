import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: stories } = await supabase
    .from("news_items")
    .select("id, published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const storyUrls: MetadataRoute.Sitemap = (stories ?? []).map((story) => ({
    url: `https://kapyn.app/story/${story.id}`,
    lastModified: new Date(story.published_at),
    changeFrequency: "never" as const,
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `https://kapyn.app/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://kapyn.app",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: "https://kapyn.app/trending",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.5,
    },
    {
      url: "https://kapyn.app/categories",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    ...categoryUrls,
    ...storyUrls,
  ];
}
