// Official MCP Registry client — registry.modelcontextprotocol.io.
//
// The registry has ~10k servers of very mixed quality, so we DON'T mirror it
// wholesale (that's the directory treadmill we're avoiding). The cron pulls a
// bounded slice, keeps only servers with a GitHub repo, and later gates them by
// star count — surfacing genuinely-adopted new servers on top of the curated set.

import type { McpCategory } from "./radar-mcp";

const REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0/servers";

export interface RegistryServer {
  registryName: string; // namespaced id, e.g. "ai.adramp/google-ads"
  displayName: string; // human title or the last path segment
  description: string;
  repoFullName: string | null; // "owner/repo" when hosted on GitHub (else null)
  url: string; // repo URL preferred, else website
}

interface RawEntry {
  server?: {
    name?: string;
    title?: string;
    description?: string;
    websiteUrl?: string;
    repository?: { url?: string; source?: string };
  };
  _meta?: Record<string, { status?: string; isLatest?: boolean }>;
}

// "github.com/owner/repo" (any suffix) → "owner/repo"; null if not GitHub.
function githubFullNameFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1].replace(/\.git$/, "")}` : null;
  } catch {
    return null;
  }
}

function displayNameFrom(name: string, title?: string): string {
  if (title && title.trim()) return title.trim();
  // "ai.adramp/google-ads" → "google-ads" → "Google Ads"
  const last = name.split("/").pop() ?? name;
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function isActiveLatest(meta: RawEntry["_meta"]): boolean {
  if (!meta) return false;
  for (const v of Object.values(meta)) {
    if (v && (v.status === "active" || v.status === undefined) && v.isLatest !== false) return true;
  }
  return false;
}

// Page through the registry, keeping active/latest servers that have a GitHub repo.
// Bounded by maxPages (30/page) so we never try to swallow the whole 10k.
export async function fetchMcpRegistryServers(maxPages = 6): Promise<RegistryServer[]> {
  const out: RegistryServer[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const url = cursor ? `${REGISTRY_URL}?cursor=${encodeURIComponent(cursor)}` : REGISTRY_URL;
    let json: { servers?: RawEntry[]; metadata?: { nextCursor?: string } };
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        next: { revalidate: 86400 },
      });
      if (!res.ok) break;
      json = await res.json();
    } catch {
      break;
    }

    const entries = json.servers ?? [];
    for (const e of entries) {
      const s = e.server;
      if (!s?.name || !s.description?.trim()) continue;
      if (!isActiveLatest(e._meta)) continue;
      const repoFullName = githubFullNameFromUrl(s.repository?.url);
      if (!repoFullName) continue; // GitHub-hosted only (dedup + star gate)
      if (seen.has(repoFullName)) continue;
      seen.add(repoFullName);
      out.push({
        registryName: s.name,
        displayName: displayNameFrom(s.name, s.title),
        description: s.description.trim(),
        repoFullName,
        url: s.repository?.url ?? s.websiteUrl ?? `https://github.com/${repoFullName}`,
      });
    }

    cursor = json.metadata?.nextCursor;
    if (!cursor) break;
  }

  return out;
}

// Coarse keyword → McpCategory mapping for discovered servers (curated ones carry
// their own category). Defaults to "Dev tools" — the safest generic bucket.
export function categorizeMcp(name: string, description: string): McpCategory {
  const t = `${name} ${description}`.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));
  if (has("postgres", "mysql", "sqlite", "database", "sql ", "mongodb", "redis", "supabase", "vector", "warehouse")) return "Databases";
  if (has("search", "web search", "scrape", "crawl", "serp", "google search")) return "Search & web";
  if (has("browser", "playwright", "puppeteer", "automation", "selenium", "headless")) return "Browser & automation";
  if (has("notion", "slack", "linear", "jira", "calendar", "email", "gmail", "docs", "productivity", "todo")) return "Productivity";
  if (has("aws", "gcp", "azure", "cloud", "kubernetes", "docker", "terraform", "infra", "deploy", "server")) return "Cloud & infra";
  if (has("memory", "reasoning", "knowledge graph", "recall", "embedding")) return "Memory & reasoning";
  if (has("stripe", "payment", "billing", "invoice", "paypal", "checkout")) return "Payments";
  return "Dev tools";
}
