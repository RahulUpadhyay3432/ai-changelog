// ─── Unified tool registry ───────────────────────────────────────────────────
// Merges the three curated, static catalogs (essentials, MCP servers, AI skills)
// into one addressable list with a stable slug per tool. Powers the tool detail
// pages (/tools/[slug]), "similar tools", and slug lookups from cards/search.
// The three static catalogs are always page-backed. Discovered items (GitHub
// trending, Product Hunt) are NOT in this synchronous registry — they live in
// radar_tools and are resolved asynchronously by getPromotedTool() below, but
// only once they clear the promotion gate in knowledge.ts. That gate is what
// keeps auto-generated pages from becoming thin doorway pages.

import { CURATED_ESSENTIALS } from "@/lib/radar-essentials";
import { MCP_SERVERS } from "@/lib/radar-mcp";
import { AI_SKILLS } from "@/lib/radar-skills";
import { slugify } from "@/lib/blog-content";

export type ToolKind = "tool" | "mcp" | "skill";

export interface UnifiedTool {
  slug: string;
  kind: ToolKind;
  name: string;
  valueLine: string;
  description?: string;
  category: string;
  url: string;
  /** AI skills only — "Claude" | "GPT" | "Gemini" | "Multi" */
  platform?: string;
  /** MCP servers only — "official" | "community" */
  by?: string;
}

const KIND_LABEL: Record<ToolKind, string> = {
  tool: "Tool",
  mcp: "MCP Server",
  skill: "AI Skill",
};

export function kindLabel(kind: ToolKind): string {
  return KIND_LABEL[kind];
}

// Built once at module load. Slugs are deduped: a collision gets the kind
// suffixed, then a numeric suffix as a last resort — so every tool is reachable.
const REGISTRY: UnifiedTool[] = (() => {
  const raw: Omit<UnifiedTool, "slug">[] = [
    ...CURATED_ESSENTIALS.map((e) => ({
      kind: "tool" as const,
      name: e.name,
      valueLine: e.valueLine,
      description: e.description,
      category: e.category,
      url: e.url,
    })),
    ...MCP_SERVERS.map((m) => ({
      kind: "mcp" as const,
      name: m.name,
      valueLine: m.tagline,
      description: m.description,
      category: m.category,
      url: m.url,
      by: m.by,
    })),
    ...AI_SKILLS.map((s) => ({
      kind: "skill" as const,
      name: s.name,
      valueLine: s.tagline,
      description: s.description,
      category: s.category,
      url: s.url,
      platform: s.platform,
    })),
  ];

  const used = new Set<string>();
  const out: UnifiedTool[] = [];
  for (const t of raw) {
    let slug = slugify(t.name);
    if (used.has(slug)) slug = `${slug}-${t.kind}`;
    let n = 2;
    while (used.has(slug)) slug = `${slugify(t.name)}-${t.kind}-${n++}`;
    used.add(slug);
    out.push({ ...t, slug });
  }
  return out;
})();

export function getAllTools(): UnifiedTool[] {
  return REGISTRY;
}

export function getToolBySlug(slug: string): UnifiedTool | undefined {
  return REGISTRY.find((t) => t.slug === slug);
}

/** Map an external url → detail slug, for cards/search to link internally. */
const URL_TO_SLUG: Map<string, string> = new Map(REGISTRY.map((t) => [t.url, t.slug]));

export function slugForUrl(url: string | null | undefined): string | undefined {
  return url ? URL_TO_SLUG.get(url) : undefined;
}

/** Other tools in the same category (then same kind), excluding the given one. */
export function similarTools(tool: UnifiedTool, n = 6): UnifiedTool[] {
  const sameCat = REGISTRY.filter((t) => t.slug !== tool.slug && t.category === tool.category);
  if (sameCat.length >= n) return sameCat.slice(0, n);
  const sameKind = REGISTRY.filter(
    (t) => t.slug !== tool.slug && t.kind === tool.kind && t.category !== tool.category,
  );
  return [...sameCat, ...sameKind].slice(0, n);
}

// ── Discovered tools promoted to their own page ──────────────────────────────
//
// The pipeline finds tools every day and renders them in the Radar, but nothing
// here was reachable by search — the catalog looked static to Google while
// actually growing. These helpers close that gap.
//
// Async on purpose: promotion depends on live traction and persistence data, so
// it cannot live in the module-level REGISTRY above. Callers union the two.

import { getPromotedTools, type PromotedTool } from "./knowledge";

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
    const taken = new Set(REGISTRY.map((t) => t.slug));
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
