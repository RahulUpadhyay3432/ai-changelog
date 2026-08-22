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
    remotes?: { type?: string; url?: string }[];
  };
  _meta?: Record<string, { status?: string; isLatest?: boolean; updatedAt?: string }>;
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

// Keyword → McpCategory mapping for discovered servers (curated ones carry their
// own category). Ordered most-specific → most-generic; FIRST match wins, so put
// narrow buckets (Payments, CRM) above broad ones (Cloud, Dev tools). Defaults to
// "Dev tools" — the safest generic bucket. Edit freely; this is the taxonomy that
// turns a flat registry into a categorized directory.
export function categorizeMcp(name: string, description: string): McpCategory {
  const t = `${name} ${description}`.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));

  if (has("stripe", "payment", "billing", "invoice", "paypal", "checkout", "subscription")) return "Payments";
  if (has("shopify", "woocommerce", "ecommerce", "e-commerce", "storefront", "product catalog", "cart")) return "E-commerce";
  if (has("salesforce", "hubspot", " crm", "pipedrive", "lead ", "sales")) return "CRM & sales";
  if (has("marketing", "campaign", "seo", "ads", "mailchimp", "newsletter", "outreach")) return "Marketing";
  if (has("figma", "canva", "sketch", "design", "prototype", "ui kit", "wireframe")) return "Design";
  if (has("map", "geocod", "places", "geospatial", "directions", "location", "weather")) return "Maps & location";
  if (has("video", "audio", "image gen", "youtube", "podcast", "transcri", "speech", "text-to-speech", "media")) return "Media";
  if (has("security", "vulnerab", "secret", "oauth", "auth ", "compliance", "pentest", "scanner", "cve")) return "Security";
  if (has("monitor", "observability", "tracing", "logging", "grafana", "datadog", "sentry", "metrics", " logs")) return "Monitoring & observability";
  if (has("scrape", "crawl", "scraper", "firecrawl", "html to markdown", "web extract")) return "Web scraping";
  if (has("web search", "serp", "google search", "brave search", "exa", "perplexity", "tavily")) return "Search & web";
  if (has("browser", "playwright", "puppeteer", "selenium", "headless", "computer use", "web automation")) return "Browser & automation";
  if (has("git ", "github", "gitlab", "bitbucket", "version control", "pull request", "commit", "repo")) return "Version control";
  if (has("docker", "kubernetes", "terraform", "ci/cd", "pipeline", "jenkins", "ansible", "helm", "deploy")) return "DevOps & CI/CD";
  if (has("postgres", "mysql", "sqlite", "database", "mongodb", "redis", "supabase", "warehouse", "clickhouse", "duckdb", "neon", "sql ")) return "Databases";
  if (has("vector", "embedding", "pinecone", "qdrant", "weaviate", "chroma", "rag")) return "Data & analytics";
  if (has("analytics", "dashboard", "tableau", "metabase", "etl", "data pipeline", "bigquery", "snowflake")) return "Data & analytics";
  if (has("memory", "knowledge graph", "recall", "reasoning", "long-term memory")) return "Memory & reasoning";
  if (has("filesystem", "file system", "storage", " s3", "google drive", "dropbox", "blob", "file access")) return "File & storage";
  if (has("aws", "gcp", "azure", "cloud", "cloudflare", "vercel", "serverless", "infra")) return "Cloud & infra";
  if (has("slack", "discord", "telegram", "email", "gmail", "whatsapp", "teams", "twilio", "sms", "chat")) return "Communication";
  if (has("notion", "confluence", "wiki", "markdown", "document", "docs", "content")) return "Docs & content";
  if (has("machine learning", "huggingface", "openai", "anthropic", " llm", "inference", "fine-tun", "model ")) return "AI & ML";
  if (has("linear", "jira", "calendar", "todo", "task", "productivity", "asana", "trello", "airtable")) return "Productivity";

  return "Dev tools";
}

// ── Verification + freshness for the CURATED set ─────────────────────────────
// Different job from fetchMcpRegistryServers above. That one DISCOVERS new
// servers; this one asks the registry a targeted question about a server we
// already list: is the official entry for this exact repo still active, and is
// the version we point at the current one?
//
// Exact-name matching matters. Searching the registry for "context7" also
// returns `ai.smithery/renCosta2025-context7fork` and
// `com.clauxel.context7docs/context7docs-mcp`. Presence in the registry is
// therefore NOT verification on its own — only the entry whose name derives
// from the repo URL we curate means "this is the official listing for the thing
// we linked to". That distinction is the entire value of the badge.

export interface RegistryStatus {
  /** Reverse-DNS id we matched, e.g. "io.github.upstash/context7". */
  registryName: string;
  /** Registry lifecycle: "active", "deprecated", "deleted". */
  status: string;
  /** False when a newer version exists than the one listed. */
  isLatest: boolean;
  /** ISO timestamp of the registry's last update to this entry. */
  updatedAt: string | null;
  /** Hosted endpoints, when the maintainer publishes any. */
  remotes: { type: string; url: string }[];
}

/** "https://github.com/upstash/context7" → "io.github.upstash/context7" */
export function registryNameForRepo(url: string): string | null {
  const full = githubFullNameFromUrl(url);
  return full ? `io.github.${full}` : null;
}

/**
 * Look up one curated server's official registry entry.
 *
 * Returns null when the server is not in the registry at all — which is common
 * and not a fault. Plenty of widely-used servers have never been published
 * there, so absence must render as "not listed", never as "unverified" or
 * anything that reads like a warning.
 */
export async function lookupRegistryStatus(repoUrl: string): Promise<RegistryStatus | null> {
  const wanted = registryNameForRepo(repoUrl);
  if (!wanted) return null;

  try {
    const res = await fetch(
      `${REGISTRY_URL}?search=${encodeURIComponent(wanted.split("/").pop() ?? "")}&limit=50`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { servers?: RawEntry[] };

    // Case-insensitive exact match on the derived name; forks and lookalikes
    // carry different namespaces and are correctly ignored.
    const hits = (json.servers ?? []).filter(
      (e) => (e.server?.name ?? "").toLowerCase() === wanted.toLowerCase(),
    );
    if (!hits.length) return null;

    // Several versions of the same server can be listed; prefer the latest.
    const best = hits.find((e) => metaOf(e)?.isLatest) ?? hits[hits.length - 1];
    const meta = metaOf(best);
    return {
      registryName: wanted,
      status: meta?.status ?? "unknown",
      isLatest: meta?.isLatest !== false,
      updatedAt: meta?.updatedAt ?? null,
      remotes: (best.server?.remotes ?? []).flatMap((r) =>
        r?.type && r?.url ? [{ type: r.type, url: r.url }] : [],
      ),
    };
  } catch {
    return null; // registry down → render as "not listed", never block the page
  }
}

function metaOf(e: RawEntry): { status?: string; isLatest?: boolean; updatedAt?: string } | null {
  const m = e._meta?.["io.modelcontextprotocol.registry/official"];
  return m ?? null;
}
