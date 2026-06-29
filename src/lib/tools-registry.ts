// ─── Unified tool registry ───────────────────────────────────────────────────
// Merges the three curated, static catalogs (essentials, MCP servers, AI skills)
// into one addressable list with a stable slug per tool. Powers the tool detail
// pages (/tools/[slug]), "similar tools", and slug lookups from cards/search.
// Dynamic items (GitHub trending, Product Hunt, news entities) are NOT here —
// they have no static detail page and keep the in-radar quick-view sheet.

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
