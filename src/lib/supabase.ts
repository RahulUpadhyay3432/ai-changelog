import { createClient } from "@supabase/supabase-js";
import type { NewsItem } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbNewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category_slug: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

function dbToNewsItem(row: DbNewsItem): NewsItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    categorySlug: row.category_slug as NewsItem["categorySlug"],
    imageUrl: row.image_url ?? undefined,
    publishedAt: row.published_at,
  };
}

export async function fetchNewsItems(categorySlug?: string): Promise<NewsItem[]> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("news_items")
    .select("*")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(100);

  if (categorySlug && categorySlug !== "all") {
    query = query.eq("category_slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DbNewsItem[]).map(dbToNewsItem);
}
