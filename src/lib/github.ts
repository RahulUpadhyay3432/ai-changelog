/**
 * GitHub Search API — surfaces new open-source AI repos going viral.
 *
 * We query for repos created in the last 48h that already have meaningful
 * stars (stars gained ≈ total stars when the repo is brand new).  Multiple
 * topic-scoped queries run in parallel; results are deduplicated by URL and
 * sorted by stars descending so the most-traction repos come first.
 *
 * No token required for the rate we use (~5 calls/cron run), but setting
 * GITHUB_TOKEN bumps the limit from 10 → 30 req/min and adds social graph
 * data. Add it to Vercel env if 429s appear.
 *
 * Docs: https://docs.github.com/en/rest/search/search#search-repositories
 */

const GH_API = "https://api.github.com/search/repositories";

// Topic clusters — tightly scoped to AI/ML engineering topics.
// Intentionally excludes broad consumer topics (generative-ai, text-to-image,
// diffusion-models) which attract piracy/spam repos and off-topic content.
const TOPIC_QUERIES = [
  { q: "topic:llm",                  minStars: 10 },
  { q: "topic:large-language-model", minStars: 10 },
  { q: "topic:ai-agent",             minStars: 10 },
  { q: "topic:rag",                  minStars: 10 },
  { q: "topic:ollama",               minStars: 10 },
  { q: "topic:langchain",            minStars: 10 },
  { q: "topic:llm-inference",        minStars: 10 },
  { q: "topic:mcp",                  minStars: 10 }, // Model Context Protocol
  { q: "topic:openai-api",           minStars: 15 },
  { q: "topic:huggingface",          minStars: 15 },
] as const;

const PER_QUERY_LIMIT = 8; // repos per topic call — keeps total under 80 items before dedup
const MAX_TOTAL = 20;      // cap after dedup + sort — same as PH

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  language: string | null;
  topics: string[];
  createdAt: string;
  owner: string;
}

interface GHSearchItem {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  owner: { login: string };
}

interface GHSearchResponse {
  items: GHSearchItem[];
  message?: string; // present on rate-limit / error responses
}

function getHeaders(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

export interface RepoMeta {
  stars: number;
  createdAt: string;
  pushedAt: string;
}

// Stars + dates for specific repos by "owner/name". Best-effort per repo (a
// renamed/missing repo just drops out). Used to rank curated lists like the MCP
// market by popularity/recency. Each fetch is cached a day at the fetch layer.
export async function fetchReposMeta(fullNames: string[]): Promise<Record<string, RepoMeta>> {
  const unique = [...new Set(fullNames)];
  const settled = await Promise.allSettled(
    unique.map(async (fullName) => {
      const res = await fetch(`https://api.github.com/repos/${fullName}`, {
        headers: getHeaders(),
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error(`GitHub repo ${fullName}: ${res.status}`);
      const r = (await res.json()) as { stargazers_count: number; created_at: string; pushed_at: string };
      return [fullName, { stars: r.stargazers_count ?? 0, createdAt: r.created_at, pushedAt: r.pushed_at }] as const;
    })
  );
  const out: Record<string, RepoMeta> = {};
  for (const e of settled) if (e.status === "fulfilled") out[e.value[0]] = e.value[1];
  return out;
}

async function searchRepos(
  topicQ: string,
  minStars: number,
  since: string
): Promise<GHSearchItem[]> {
  const q = `${topicQ} created:>${since} stars:>=${minStars}`;
  const url = `${GH_API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${PER_QUERY_LIMIT}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} for "${topicQ}": ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as GHSearchResponse;
  if (data.message) throw new Error(`GitHub API error: ${data.message}`);
  return data.items ?? [];
}

/**
 * Fetch recently-created AI/ML repos that are gaining traction on GitHub.
 *
 * @param hoursBack  Look-back window (default 48h to match the feed window)
 */
export async function fetchGitHubTrendingRepos(hoursBack = 48): Promise<GitHubRepo[]> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10); // YYYY-MM-DD — GitHub Search accepts date-only

  const settled = await Promise.allSettled(
    TOPIC_QUERIES.map(({ q, minStars }) => searchRepos(q, minStars, since))
  );

  const seen = new Set<string>();
  const repos: GHSearchItem[] = [];

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (!seen.has(item.html_url)) {
        seen.add(item.html_url);
        repos.push(item);
      }
    }
  }

  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_TOTAL)
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? null,
      htmlUrl: r.html_url,
      stars: r.stargazers_count,
      language: r.language ?? null,
      topics: r.topics ?? [],
      createdAt: r.created_at,
      owner: r.owner.login,
    }));
}

// ── Essentials canon — most-starred, still-maintained AI repos ───────────────
// Unlike fetchGitHubTrendingRepos (created in last 48h), this surfaces the
// established open-source canon (LangChain, Ollama, vLLM, …) for the radar's
// "Essentials" layer. The pushed:> filter drops abandoned high-star zombies.
const CANON_MIN_STARS = 3000;
const CANON_MAINTAINED_DAYS = 180;
const CANON_MAX_TOTAL = 20;

async function searchTopRepos(topicQ: string, pushedSince: string): Promise<GHSearchItem[]> {
  const q = `${topicQ} stars:>=${CANON_MIN_STARS} pushed:>${pushedSince}`;
  const url = `${GH_API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} for canon "${topicQ}": ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as GHSearchResponse;
  if (data.message) throw new Error(`GitHub API error: ${data.message}`);
  return data.items ?? [];
}

/**
 * Fetch the established, still-maintained open-source AI canon by total stars.
 * Powers the radar "Essentials" layer (evergreen, not time-sensitive).
 */
export async function fetchTopAIRepos(): Promise<GitHubRepo[]> {
  const pushedSince = new Date(Date.now() - CANON_MAINTAINED_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const settled = await Promise.allSettled(
    TOPIC_QUERIES.map(({ q }) => searchTopRepos(q, pushedSince))
  );

  const seen = new Set<string>();
  const repos: GHSearchItem[] = [];
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (!seen.has(item.html_url)) {
        seen.add(item.html_url);
        repos.push(item);
      }
    }
  }

  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, CANON_MAX_TOTAL)
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? null,
      htmlUrl: r.html_url,
      stars: r.stargazers_count,
      language: r.language ?? null,
      topics: r.topics ?? [],
      createdAt: r.created_at,
      owner: r.owner.login,
    }));
}

/**
 * Build the content string passed to classifyAndSummarize.
 * Packs in everything the LLM needs: description, stars (social proof),
 * language, and topics (help classification).
 */
export function buildGitHubContent(repo: GitHubRepo): string {
  const parts: string[] = [];
  if (repo.description) parts.push(repo.description.trim());
  parts.push(`${repo.stars.toLocaleString()} GitHub stars since launch.`);
  if (repo.language) parts.push(`Primary language: ${repo.language}.`);
  if (repo.topics.length) parts.push(`Topics: ${repo.topics.slice(0, 8).join(", ")}.`);
  parts.push(`Repository: ${repo.fullName} by ${repo.owner}.`);
  return parts.join(" ");
}
