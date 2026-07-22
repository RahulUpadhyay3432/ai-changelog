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
