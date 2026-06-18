import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchGitHubTrendingRepos, fetchTopAIRepos } from "@/lib/github";
import { fetchProductHuntPosts } from "@/lib/producthunt";
import { slugify } from "@/lib/entities";
import { CURATED_ESSENTIALS } from "@/lib/radar-essentials";
import { isAuthorizedCron } from "@/lib/cron-auth";

// Pulls the radar tool sources into radar_tools. Each value-line is the maker's
// OWN description/tagline (or our curated copy) — no LLM, no drift. Two layers:
//   trending  — GitHub created-last-48h + Product Hunt (what's new)
//   essential — most-starred maintained AI repos + a curated closed-tools list
// Cron-triggered (see vercel.json); degrades gracefully if a source fails.
export const runtime = "nodejs";
export const maxDuration = 60;

const CANON_SORT_RANK = 1000; // essentials: curated (by list order) first, canon after

function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function cleanLine(s: string): string {
  // Strip emoji/pictographs (calm brand: no emoji in content), then tidy.
  return cleanText(s).slice(0, 160);
}

// Same scrub as cleanLine, but for the longer detail-sheet body (no 160 cap).
function cleanText(s: string): string {
  return s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

interface ToolRow {
  source: "github" | "producthunt" | "curated";
  external_id: string;
  name: string;
  value_line: string;
  url: string;
  meta: string | null;
  score: number;
  topics: string[];
  kind: "trending" | "essential";
  sort_rank: number;
  last_seen_at: string;
  description: string | null; // longer body for the detail sheet (PH only today)
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY required" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const rows: ToolRow[] = [];
  const errors: string[] = [];

  const [gh, ph, canon] = await Promise.allSettled([
    fetchGitHubTrendingRepos(48),
    fetchProductHuntPosts(48),
    fetchTopAIRepos(),
  ]);

  // ── Trending: GitHub created-last-48h ──
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
        kind: "trending",
        sort_rank: 0,
        last_seen_at: now,
        description: null,
      });
    }
  } else {
    errors.push(`github: ${String(gh.reason).slice(0, 120)}`);
  }

  // ── Trending: Product Hunt ──
  if (ph.status === "fulfilled") {
    for (const p of ph.value) {
      const line = (p.tagline?.trim() || p.description?.trim()) ?? "";
      if (!line) continue;
      // Keep the punchy tagline as the value-line; carry the fuller description
      // for the detail sheet (the user asked for it). Drop if it just repeats.
      const desc = p.description ? cleanText(p.description).slice(0, 600) : "";
      rows.push({
        source: "producthunt",
        external_id: p.sourceUrl, // PHFeedItem drops the id; the launch url is unique
        name: p.title,
        value_line: cleanLine(line),
        url: p.sourceUrl,
        meta: `${compact(p.votesCount)} upvotes`,
        score: p.votesCount,
        topics: p.topics ?? [],
        kind: "trending",
        sort_rank: 0,
        last_seen_at: now,
        description: desc && desc !== cleanLine(line) ? desc : null,
      });
    }
  } else {
    errors.push(`producthunt: ${String(ph.reason).slice(0, 120)}`);
  }

  // ── Essentials: open-source canon (most-starred, maintained) ──
  if (canon.status === "fulfilled") {
    for (const r of canon.value) {
      if (!r.description || !r.description.trim()) continue;
      rows.push({
        source: "github",
        external_id: `canon:${r.fullName}`, // namespaced so it never collides with the trending row
        name: r.name,
        value_line: cleanLine(r.description),
        url: r.htmlUrl,
        meta: [`${compact(r.stars)} stars`, r.language].filter(Boolean).join(" · "),
        score: r.stars,
        topics: r.topics ?? [],
        kind: "essential",
        sort_rank: CANON_SORT_RANK,
        last_seen_at: now,
        description: null,
      });
    }
  } else {
    errors.push(`canon: ${String(canon.reason).slice(0, 120)}`);
  }

  // ── Essentials: curated closed-tools list (accessible-first by list order) ──
  CURATED_ESSENTIALS.forEach((t, i) => {
    rows.push({
      source: "curated",
      external_id: slugify(t.name),
      name: t.name,
      value_line: cleanLine(t.valueLine),
      url: t.url,
      meta: t.category,
      score: 0,
      topics: [],
      kind: "essential",
      sort_rank: i, // 0..N — keeps the accessible-first ordering
      last_seen_at: now,
      description: null,
    });
  });

  let upserted = 0;
  if (rows.length > 0) {
    // first_seen_at omitted → kept on conflict; the rest refresh.
    const { error } = await getAdmin()
      .from("radar_tools")
      .upsert(rows, { onConflict: "source,external_id" });
    if (error) errors.push(`upsert: ${error.message}`);
    else upserted = rows.length;
  }

  return Response.json({
    trending: {
      github: gh.status === "fulfilled" ? gh.value.length : 0,
      producthunt: ph.status === "fulfilled" ? ph.value.length : 0,
    },
    essential: {
      canon: canon.status === "fulfilled" ? canon.value.length : 0,
      curated: CURATED_ESSENTIALS.length,
    },
    upserted,
    errors,
  });
}
