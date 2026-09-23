import { createClient } from "@supabase/supabase-js";
import { isAuthorizedHermes } from "@/lib/hermes-auth";
import { isGenericEntityName } from "@/lib/entities";
import { BLOG_POSTS } from "@/lib/blog-content";
import playbookConfig from "../../../../../playbook/config.json";

export const runtime = "nodejs";

// GET /api/blog/candidates?days=7 — intake for the HERMES weekly blog mission.
// Groups the last N days of the durable story archive by entity and returns the
// clusters big enough to write a synthesis post from (playbook/config.json →
// candidates), plus the posts Kapyn already has. The topic step picks one.
//
// Read-only, so it uses the anon client: RLS exposes story_archive,
// entity_mentions and active entities only. HERMES_SECRET gates it anyway so the
// corpus dump isn't a public endpoint.

const MAX_STORIES_PER_CLUSTER = 12; // playbook/schemas/topic.schema.json story_ids maxItems
const MAX_ROWS = 2000;

type StoryRow = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category_slug: string;
  published_at: string;
  entity_mentions: { entities: { slug: string; canonical_name: string; entity_type: string } | null }[];
};

type Story = Omit<StoryRow, "entity_mentions">;

type Cluster = {
  entity: { slug: string; name: string; type: string };
  story_count: number;
  source_count: number;
  stories: Story[];
};

function intParam(url: URL, name: string, fallback: number, min: number, max: number): number | null {
  const raw = url.searchParams.get(name);
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= min && n <= max ? n : null;
}

export async function GET(request: Request) {
  if (!isAuthorizedHermes(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const defaults = playbookConfig.candidates;
  const days = intParam(url, "days", defaults.days, 1, 30);
  const minStories = intParam(url, "min_stories", defaults.min_stories, 1, 50);
  const minSources = intParam(url, "min_sources", defaults.min_distinct_sources, 1, 20);
  const maxClusters = intParam(url, "max_clusters", 25, 1, 50);
  if (days === null || minStories === null || minSources === null || maxClusters === null) {
    return Response.json({ error: "invalid_params" }, { status: 400 });
  }

  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { data, error } = await supabase
    .from("story_archive")
    .select(
      "id, title, summary, source_url, source_name, category_slug, published_at, entity_mentions(entities(slug, canonical_name, entity_type))"
    )
    .gte("published_at", from.toISOString())
    .order("published_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    console.error("[blog/candidates] story_archive query failed:", error.message);
    return Response.json({ error: "candidates_unavailable" }, { status: 502 });
  }

  const rows = (data ?? []) as unknown as StoryRow[];

  // ─── Group by entity ───────────────────────────────────────────────────────
  // Rows arrive newest first, so each cluster's stories do too.
  const byEntity = new Map<string, { entity: Cluster["entity"]; stories: Story[] }>();
  let storiesWithEntities = 0;
  for (const { entity_mentions, ...story } of rows) {
    let counted = false;
    for (const m of entity_mentions ?? []) {
      const e = m.entities; // null when RLS hides the entity (status 'hidden')
      if (!e || isGenericEntityName(e.canonical_name)) continue;
      if (!counted) {
        storiesWithEntities++;
        counted = true;
      }
      let bucket = byEntity.get(e.slug);
      if (!bucket) {
        bucket = { entity: { slug: e.slug, name: e.canonical_name, type: e.entity_type }, stories: [] };
        byEntity.set(e.slug, bucket);
      }
      bucket.stories.push(story);
    }
  }

  const qualifying: Cluster[] = [];
  for (const { entity, stories } of byEntity.values()) {
    const sourceCount = new Set(stories.map((s) => s.source_name)).size;
    if (stories.length < minStories || sourceCount < minSources) continue;
    qualifying.push({
      entity,
      story_count: stories.length,
      source_count: sourceCount,
      stories: stories.slice(0, MAX_STORIES_PER_CLUSTER),
    });
  }
  qualifying.sort(
    (a, b) =>
      b.story_count - a.story_count ||
      b.source_count - a.source_count ||
      b.stories[0].published_at.localeCompare(a.stories[0].published_at)
  );
  const clusters = qualifying.slice(0, maxClusters);

  return Response.json(
    {
      generated_at: to.toISOString(),
      window: { days, from: from.toISOString(), to: to.toISOString() },
      thresholds: { min_stories: minStories, min_distinct_sources: minSources },
      stats: {
        stories_in_window: rows.length,
        stories_with_entities: storiesWithEntities,
        entities_seen: byEntity.size,
        clusters_qualifying: qualifying.length,
        clusters_returned: clusters.length,
      },
      clusters,
      already_covered: BLOG_POSTS.map((p) => ({ slug: p.slug, title: p.title, date: p.date })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
