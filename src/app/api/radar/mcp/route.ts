import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchReposMeta } from "@/lib/github";
import { slugify } from "@/lib/entities";
import { MCP_SERVERS, githubFullName } from "@/lib/radar-mcp";
import { fetchMcpRegistryServers, categorizeMcp } from "@/lib/mcp-registry";
import { isAuthorizedCron } from "@/lib/cron-auth";

// Populates radar_mcp with two layers (same table):
//   featured   — the curated MCP_SERVERS editorial list (guaranteed, list order)
//   discovered — servers from the official MCP registry, gated to GitHub repos
//                with >= MIN_STARS, ranked by stars, deduped against curated.
// Cron-triggered (see vercel.json). Degrades gracefully; the page falls back to
// the static curated list if this table is empty.
export const runtime = "nodejs";
export const maxDuration = 60;

// Quality gate + breadth for the self-updating registry layer. Widened to make
// the directory genuinely deep (MCP-Market scale) while a star floor still keeps
// the dead long tail out. The set fills toward MAX over successive daily runs as
// GitHub star lookups warm their day-cache (set GITHUB_TOKEN in Vercel to fill
// faster — it raises the GitHub rate limit from 60/hr to 5000/hr).
const MIN_STARS = 10;
const MAX_DISCOVERED = 300;

function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface McpRow {
  source: "curated" | "registry";
  external_id: string;
  name: string;
  tagline: string;
  description: string | null;
  category: string;
  url: string;
  by: "official" | "community";
  score: number;
  gh_created_at: string | null;
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

  // Discover from the registry (best-effort).
  let discovered: Awaited<ReturnType<typeof fetchMcpRegistryServers>> = [];
  try {
    discovered = await fetchMcpRegistryServers(20);
  } catch (e) {
    errors.push(`registry: ${String(e).slice(0, 120)}`);
  }

  // Curated GitHub repos + discovered repos → one star-enrichment batch (daily,
  // so unauthenticated GitHub rate limits are fine).
  const curatedFullByUrl = new Map<string, string>();
  const curatedFullNames = new Set<string>();
  for (const s of MCP_SERVERS) {
    const fn = githubFullName(s.url);
    if (fn) {
      curatedFullByUrl.set(s.url, fn);
      curatedFullNames.add(fn);
    }
  }
  // Drop discovered servers already in the curated set (curated wins).
  discovered = discovered.filter((d) => d.repoFullName && !curatedFullNames.has(d.repoFullName));

  const allFullNames = [
    ...curatedFullByUrl.values(),
    ...discovered.map((d) => d.repoFullName!).filter(Boolean),
  ];
  let meta: Record<string, { stars: number; createdAt: string }> = {};
  try {
    meta = await fetchReposMeta(allFullNames);
  } catch (e) {
    errors.push(`stars: ${String(e).slice(0, 120)}`);
  }

  const rows: McpRow[] = [];

  // ── Featured: the curated editorial list (list order = accessible-first) ──
  MCP_SERVERS.forEach((s, i) => {
    const fn = githubFullName(s.url);
    const m = fn ? meta[fn] : undefined;
    rows.push({
      source: "curated",
      external_id: slugify(s.name) || s.url,
      name: s.name,
      tagline: s.tagline,
      description: s.description,
      category: s.category,
      url: s.url,
      by: s.by,
      score: m?.stars ?? 0,
      gh_created_at: m?.createdAt ?? null,
      kind: "featured",
      sort_rank: i,
      last_seen_at: now,
    });
  });

  // ── Discovered: registry servers, star-gated, ranked by stars ──
  const gated = discovered
    .map((d) => ({ d, stars: meta[d.repoFullName!]?.stars ?? 0, createdAt: meta[d.repoFullName!]?.createdAt ?? null }))
    .filter((x) => x.stars >= MIN_STARS)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, MAX_DISCOVERED);

  for (const { d, stars, createdAt } of gated) {
    rows.push({
      source: "registry",
      external_id: d.repoFullName!,
      name: d.displayName,
      tagline: d.description.slice(0, 120),
      description: d.description.slice(0, 400),
      category: categorizeMcp(d.displayName, d.description),
      url: d.url,
      by: "community",
      score: stars,
      gh_created_at: createdAt,
      kind: "discovered",
      sort_rank: 0,
      last_seen_at: now,
    });
  }

  let upserted = 0;
  if (rows.length > 0) {
    const { error } = await getAdmin()
      .from("radar_mcp")
      .upsert(rows, { onConflict: "source,external_id" });
    if (error) errors.push(`upsert: ${error.message}`);
    else upserted = rows.length;
  }

  return Response.json({
    featured: MCP_SERVERS.length,
    discoveredFound: discovered.length,
    discoveredKept: gated.length,
    upserted,
    errors,
  });
}
