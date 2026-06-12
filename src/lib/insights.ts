import { supabase } from "./supabase";
import type { Insight } from "./types";

interface DbInsight {
  id: string;
  title: string;
  subtitle: string | null;
  cover_image_url: string | null;
  accent_color: string;
  slides: Array<{ imageUrl: string }>;
  published_at: string;
}

function dbToInsight(row: DbInsight): Insight {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? null,
    coverImageUrl: row.cover_image_url ?? null,
    accentColor: row.accent_color ?? "#7c3aed",
    slides: row.slides ?? [],
    publishedAt: row.published_at,
  };
}

export async function fetchActiveInsight(): Promise<Insight | null> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return dbToInsight(data as DbInsight);
}
