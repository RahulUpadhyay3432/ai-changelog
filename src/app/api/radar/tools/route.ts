import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchGitHubTrendingRepos } from "@/lib/github";
import { fetchProductHuntPosts } from "@/lib/producthunt";

// Pulls GitHub trending + Product Hunt into radar_tools. Each item's value-line
// is the maker's OWN description/tagline — no LLM, no drift. Cron-triggered
// (see vercel.json); degrades gracefully if one source fails.
export const runtime = "nodejs";
export const maxDuration = 60;

function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function cleanLine(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 160);
}

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

interface ToolRow {
  source: "github" | "producthunt";
  external_id: string;
  name: string;
  value_line: string;
  url: string;
  meta: string | null;
  score: number;
  topics: string[];
  last_seen_at: string;
}

export async function GET(request: NextRequest) {
  const secret =
    request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY required" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const rows: ToolRow[] = [];
  const errors: string[] = [];

  const [gh, ph] = await Promise.allSettled([
    fetchGitHubTrendingRepos(48),
    fetchProductHuntPosts(48),
  ]);

  if (gh.status === "fulfilled") {
    for (const r of gh.value) {
      // No self-description → can't ship a trustworthy value-line, skip it.
      if (!r.description || !r.description.trim()) continue;
      rows.push({
        source: "github",
        external_id: r.fullName,
        name: r.name,
        value_line: cleanLine(r.description),
        url: r.htmlUrl,
        meta: [`${compact(r.stars)} stars`, r.language].filter(Boolean).join(" · "),
        score: r.stars,
        topics: r.topics ?? [],
        last_seen_at: now,
      });
    }
  } else {
    errors.push(`github: ${String(gh.reason).slice(0, 120)}`);
  }

  if (ph.status === "fulfilled") {
    for (const p of ph.value) {
      const line = (p.tagline?.trim() || p.description?.trim()) ?? "";
      if (!line) continue;
      rows.push({
        source: "producthunt",
        external_id: p.sourceUrl, // PHFeedItem drops the id; the launch url is unique
        name: p.title,
        value_line: cleanLine(line),
        url: p.sourceUrl,
        meta: `${compact(p.votesCount)} upvotes`,
        score: p.votesCount,
        topics: p.topics ?? [],
        last_seen_at: now,
      });
    }
  } else {
    errors.push(`producthunt: ${String(ph.reason).slice(0, 120)}`);
  }

  let upserted = 0;
  if (rows.length > 0) {
    // first_seen_at omitted → kept on conflict; last_seen_at/value_line/score refresh.
    const { error } = await getAdmin()
      .from("radar_tools")
      .upsert(rows, { onConflict: "source,external_id" });
    if (error) errors.push(`upsert: ${error.message}`);
    else upserted = rows.length;
  }

  return Response.json({
    github: gh.status === "fulfilled" ? gh.value.length : 0,
    producthunt: ph.status === "fulfilled" ? ph.value.length : 0,
    upserted,
    errors,
  });
}
