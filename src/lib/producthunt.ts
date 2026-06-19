/**
 * Product Hunt GraphQL API v2 service
 * Replaces the unreliable RSS + Cloudflare-blocked scraping approach.
 *
 * Docs: https://api.producthunt.com/v2/docs
 */

const PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql";

// Topics we care about — fetch AI and dev tools in parallel
const PH_TOPICS = ["artificial-intelligence", "developer-tools"] as const;

// Minimum upvotes to be considered "signal"
const MIN_VOTES = 8;

// ─── Types ───────────────────────────────────────────────────────────────────

interface PHTopicNode {
  slug: string;
  name: string;
}

interface PHPost {
  id: string;
  name: string;
  tagline: string;
  description: string | null;
  thumbnail: { url: string } | null;
  votesCount: number;
  url: string;
  website: string | null;
  createdAt: string;
  topics: {
    edges: Array<{ node: PHTopicNode }>;
  };
}

interface PHPostsResponse {
  data: {
    posts: {
      edges: Array<{ node: PHPost }>;
    };
  };
  errors?: Array<{ message: string; locations?: unknown }>;
}

export interface PHFeedItem {
  /** Product name */
  title: string;
  /** Short tagline (1 line) */
  tagline: string;
  /** Full description — may be null for very new launches */
  description: string | null;
  /** og:image / thumbnail from PH */
  imageUrl: string | null;
  /** Upvote count at fetch time */
  votesCount: number;
  /** Canonical PH launch URL */
  sourceUrl: string;
  /** The maker's own product website (for meta enrichment) — may be null */
  website: string | null;
  /** ISO 8601 launch date */
  publishedAt: string;
  /** Topic slugs for secondary classification */
  topics: string[];
}

// ─── GraphQL query ────────────────────────────────────────────────────────────

const POSTS_QUERY = /* GraphQL */ `
  query GetPosts($first: Int!, $postedAfter: DateTime, $topic: String) {
    posts(first: $first, postedAfter: $postedAfter, topic: $topic, order: VOTES) {
      edges {
        node {
          id
          name
          tagline
          description
          thumbnail {
            url
          }
          votesCount
          url
          website
          createdAt
          topics {
            edges {
              node {
                slug
                name
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchTopic(
  token: string,
  topic: string,
  postedAfter: string
): Promise<PHPost[]> {
  const res = await fetch(PH_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: POSTS_QUERY,
      variables: { first: 20, postedAfter, topic },
    }),
    // Next.js fetch cache: revalidate every 30 min to avoid hammering the API
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PH API HTTP ${res.status} for topic "${topic}": ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as PHPostsResponse;

  if (json.errors?.length) {
    throw new Error(
      `PH GraphQL error (topic "${topic}"): ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  return json.data?.posts?.edges?.map((e) => e.node) ?? [];
}

/**
 * Build a ~40-80 word summary from structured PH data.
 * Falls back gracefully if fields are sparse.
 */
export function buildPHSummary(post: PHFeedItem): string {
  const parts: string[] = [];

  // Tagline is always present and punchy — lead with it
  if (post.tagline) parts.push(post.tagline.trim());

  // Append description if it adds new info (not just a repeat of tagline)
  if (post.description && post.description.trim() !== post.tagline.trim()) {
    // Cap at ~120 chars so total stays in 40-80 word range
    const desc = post.description.trim().replace(/\s+/g, " ");
    const trimmed = desc.length > 400 ? desc.slice(0, 400).replace(/\s\S+$/, "…") : desc;
    parts.push(trimmed);
  }

  // Add social proof for high-traction launches
  if (post.votesCount >= 100) {
    parts.push(`${post.votesCount.toLocaleString()} upvotes on Product Hunt.`);
  }

  const full = parts.join(" ");
  // Hard cap — downstream summarizer handles the rest if still too long
  return full.slice(0, 600);
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Fetch recent high-signal AI / dev-tool launches from the PH GraphQL API.
 *
 * @param hoursBack  Look-back window in hours (default 48h to match feed window)
 * @returns Deduplicated, vote-filtered, sorted PHFeedItem array
 */
export async function fetchProductHuntPosts(hoursBack = 48): Promise<PHFeedItem[]> {
  const token = process.env.PRODUCT_HUNT_TOKEN;
  if (!token) {
    throw new Error(
      "PRODUCT_HUNT_TOKEN environment variable is not set. " +
        "Add it to .env.local to enable Product Hunt integration."
    );
  }

  const postedAfter = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  // Parallel fetch across topics
  const settled = await Promise.allSettled(
    PH_TOPICS.map((topic) => fetchTopic(token, topic, postedAfter))
  );

  // Collect results + surface non-fatal errors
  const errors: string[] = [];
  const seen = new Set<string>();
  const posts: PHPost[] = [];

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    if (result.status === "fulfilled") {
      for (const post of result.value) {
        if (!seen.has(post.id)) {
          seen.add(post.id);
          posts.push(post);
        }
      }
    } else {
      errors.push(`Topic "${PH_TOPICS[i]}": ${result.reason}`);
    }
  }

  // Both topics failed → surface the error
  if (posts.length === 0 && errors.length === PH_TOPICS.length) {
    throw new Error(`All PH topic fetches failed:\n${errors.join("\n")}`);
  }

  return posts
    .filter((p) => p.votesCount >= MIN_VOTES)
    .sort((a, b) => b.votesCount - a.votesCount)
    .slice(0, 15)
    .map((p) => ({
      title: p.name,
      tagline: p.tagline,
      description: p.description ?? null,
      imageUrl: p.thumbnail?.url ?? null,
      votesCount: p.votesCount,
      sourceUrl: p.url,
      website: p.website ?? null,
      publishedAt: p.createdAt,
      topics: p.topics.edges.map((e) => e.node.slug),
    }));
}
