// ── Discovered tools promoted to their own page ──────────────────────────────
//
// Split out of tools-registry.ts on purpose. knowledge.ts builds its Supabase
// client at module load, so anything importing it inherits a hard requirement on
// database credentials. tools-registry is imported widely and answers questions
// that need no database, so the DB-backed half lives here instead and is
// imported only by the pages that actually query it.

import { getPromotedTools, type PromotedTool } from "@/lib/knowledge";
import { getToolBySlug, REGISTRY_SLUGS, type UnifiedTool } from "@/lib/tools-registry";
import { slugify } from "@/lib/blog-content";



function promotedToUnified(p: PromotedTool): UnifiedTool {
  return {
    slug: slugify(p.name),
    kind: "tool",
    name: p.name,
    valueLine: p.valueLine,
    description: p.description ?? undefined,
    category: p.source === "producthunt" ? "New launches" : "Trending open source",
    url: p.url,
  };
}

/**
 * Promoted tools as UnifiedTool, with any slug that already belongs to a curated
 * entry dropped. The curated version always wins: it has hand-written depth,
 * where a promoted entry has an LLM one-liner.
 */
export async function getPromotedToolPages(): Promise<UnifiedTool[]> {
  try {
    const promoted = await getPromotedTools();
    const taken = REGISTRY_SLUGS;
    const seen = new Set<string>();
    return promoted.flatMap((p) => {
      const u = promotedToUnified(p);
      if (!u.slug || taken.has(u.slug) || seen.has(u.slug)) return [];
      seen.add(u.slug);
      return [u];
    });
  } catch {
    return []; // DB unreachable → fall back to the curated set, never a broken build
  }
}

/** Curated first, then promoted. Returns undefined when neither has the slug. */
export async function getToolBySlugAsync(slug: string): Promise<UnifiedTool | undefined> {
  const curated = getToolBySlug(slug);
  if (curated) return curated;
  return (await getPromotedToolPages()).find((t) => t.slug === slug);
}
