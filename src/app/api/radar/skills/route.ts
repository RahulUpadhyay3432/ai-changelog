import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/entities";
import { AI_SKILLS } from "@/lib/radar-skills";
import { fetchAnthropicSkills, categorizeSkill } from "@/lib/skills-registry";
import { isAuthorizedCron } from "@/lib/cron-auth";

// Populates radar_skills with two layers:
//   featured   — the curated AI_SKILLS editorial list (list order)
//   discovered — official Anthropic skills auto-pulled from github.com/anthropics/skills
//                (real SKILL.md copy), deduped against curated.
// Cron-triggered (see vercel.json). Page falls back to the static list if empty.
export const runtime = "nodejs";
export const maxDuration = 60;

function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface SkillRow {
  source: "curated" | "official";
  external_id: string;
  name: string;
  tagline: string;
  description: string | null;
  category: string;
  platform: "Claude" | "GPT" | "Gemini" | "Multi";
  url: string;
  kind: "featured" | "discovered";
  sort_rank: number;
  last_seen_at: string;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY required" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const errors: string[] = [];
  const rows: SkillRow[] = [];

  // ── Featured: curated editorial list ──
  const curatedSlugs = new Set<string>();
  AI_SKILLS.forEach((s, i) => {
    const slug = slugify(s.name) || s.url;
    curatedSlugs.add(slug);
    rows.push({
      source: "curated",
      external_id: slug,
      name: s.name,
      tagline: s.tagline,
      description: s.description,
      category: s.category,
      platform: s.platform,
      url: s.url,
      kind: "featured",
      sort_rank: i,
      last_seen_at: now,
    });
  });

  // ── Discovered: official Anthropic skills (real SKILL.md copy) ──
  let official: Awaited<ReturnType<typeof fetchAnthropicSkills>> = [];
  try {
    official = await fetchAnthropicSkills();
  } catch (e) {
    errors.push(`anthropic-skills: ${String(e).slice(0, 120)}`);
  }

  let discovered = 0;
  for (const sk of official) {
    if (curatedSlugs.has(slugify(sk.name)) || curatedSlugs.has(sk.slug)) continue; // curated wins
    discovered++;
    rows.push({
      source: "official",
      external_id: `anthropic/${sk.slug}`,
      name: sk.name,
      tagline: sk.description.slice(0, 120),
      description: sk.description.slice(0, 400),
      category: categorizeSkill(sk.name, sk.description),
      platform: "Claude",
      url: sk.url,
      kind: "discovered",
      sort_rank: 0,
      last_seen_at: now,
    });
  }

  let upserted = 0;
  if (rows.length > 0) {
    const { error } = await getAdmin()
      .from("radar_skills")
      .upsert(rows, { onConflict: "source,external_id" });
    if (error) errors.push(`upsert: ${error.message}`);
    else upserted = rows.length;
  }

  return Response.json({
    featured: AI_SKILLS.length,
    officialFound: official.length,
    discoveredKept: discovered,
    upserted,
    errors,
  });
}
