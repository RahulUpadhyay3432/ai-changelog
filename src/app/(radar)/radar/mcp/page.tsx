import type { Metadata } from "next";
import { fetchReposMeta } from "@/lib/github";
import { MCP_SERVERS, githubFullName } from "@/lib/radar-mcp";
import { AI_SKILLS } from "@/lib/radar-skills";
import { getRadarMcpServers, getRadarSkills } from "@/lib/knowledge";
import { McpMarketClient, type McpMeta } from "../McpMarketClient";

// MCP + skills market, grouped by category. Reads radar_mcp / radar_skills
// (curated featured set + registry/official discoveries, populated by the radar
// crons) and falls back to the static curated catalogs if a table is empty.
// Stars come from the DB (cron-enriched) when available; only the static
// fallback stars at render time. ISR-cached.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "MCP servers & AI skills",
  description: "The most useful MCP servers and AI skills, by category.",
};

export default async function McpMarketPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialView = tab === "skills" ? "skills" : "mcp";

  const [db, dbSkills] = await Promise.all([getRadarMcpServers(), getRadarSkills()]);

  const skills = dbSkills.length > 0 ? dbSkills : AI_SKILLS;
  const meta: Record<string, McpMeta> = {};

  // Prefer the live MCP table (curated + registry-discovered, stars pre-enriched
  // by the cron — no render-time GitHub calls).
  if (db.servers.length > 0) {
    for (const [url, m] of Object.entries(db.meta)) {
      meta[url] = { stars: m.stars, createdAt: m.createdAt };
    }
    return <McpMarketClient meta={meta} servers={db.servers} skills={skills} initialView={initialView} />;
  }

  // Fallback: static curated MCP catalog, enriched with GitHub stars at render.
  const fullByUrl = new Map<string, string>();
  for (const s of MCP_SERVERS) {
    const fn = githubFullName(s.url);
    if (fn) fullByUrl.set(s.url, fn);
  }
  try {
    const repoMeta = await fetchReposMeta([...fullByUrl.values()]);
    for (const [url, fullName] of fullByUrl) {
      const m = repoMeta[fullName];
      if (m) meta[url] = { stars: m.stars, createdAt: m.createdAt };
    }
  } catch {
    // stars are optional — the market still renders without them
  }

  return <McpMarketClient meta={meta} servers={MCP_SERVERS} skills={skills} initialView={initialView} />;
}
