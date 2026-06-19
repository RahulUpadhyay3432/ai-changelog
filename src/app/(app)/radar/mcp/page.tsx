import type { Metadata } from "next";
import { fetchReposMeta } from "@/lib/github";
import { MCP_SERVERS, githubFullName } from "@/lib/radar-mcp";
import { McpMarketClient, type McpMeta } from "../McpMarketClient";

// MCP market — a curated directory of Model Context Protocol servers, grouped by
// category. Static catalog (src/lib/radar-mcp.ts), enriched with GitHub stars +
// dates so the Popular / Newest sorts are real. ISR-cached.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "MCP market — Kapyn Radar",
  description: "The most useful Model Context Protocol servers, by category.",
};

export default async function McpMarketPage() {
  // Map each server's URL → its "owner/repo" (when it's a GitHub repo), fetch
  // stars + created dates, then key the result back by URL for the client.
  const fullByUrl = new Map<string, string>();
  for (const s of MCP_SERVERS) {
    const fn = githubFullName(s.url);
    if (fn) fullByUrl.set(s.url, fn);
  }

  let repoMeta: Record<string, { stars: number; createdAt: string; pushedAt: string }> = {};
  try {
    repoMeta = await fetchReposMeta([...fullByUrl.values()]);
  } catch {
    repoMeta = {};
  }

  const meta: Record<string, McpMeta> = {};
  for (const [url, fullName] of fullByUrl) {
    const m = repoMeta[fullName];
    if (m) meta[url] = { stars: m.stars, createdAt: m.createdAt };
  }

  return <McpMarketClient meta={meta} />;
}
