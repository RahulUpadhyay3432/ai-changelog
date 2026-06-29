// ─── Shared search index ─────────────────────────────────────────────────────
// One in-memory index over the curated catalog + guides, used by both the
// /search page and the ⌘K command palette. Tools/MCP/skills link INTERNALLY to
// their detail page (/tools/[slug]); the external site lives on that page.

import { BLOG_POSTS } from "@/lib/blog-content";
import { getAllTools } from "@/lib/tools-registry";

export type ResultKind = "tool" | "mcp" | "skill" | "guide";

export interface SearchResult {
  kind: ResultKind;
  name: string;
  tagline: string;
  category: string;
  href: string; // internal navigation target
  siteUrl?: string; // external site (favicon source; undefined for guides)
}

export const KIND_LABEL: Record<ResultKind, string> = {
  tool: "Tools & Agents",
  mcp: "MCP Servers",
  skill: "AI Skills",
  guide: "Guides",
};

export const KIND_ORDER: ResultKind[] = ["tool", "mcp", "skill", "guide"];

export const ALL_RESULTS: SearchResult[] = [
  ...getAllTools().map((t) => ({
    kind: t.kind,
    name: t.name,
    tagline: t.valueLine,
    category: t.category,
    href: `/tools/${t.slug}`,
    siteUrl: t.url,
  })),
  ...BLOG_POSTS.map((p) => ({
    kind: "guide" as const,
    name: p.title,
    tagline: p.deck,
    category: p.tag,
    href: `/blog/${p.slug}`,
  })),
];

export function faviconFor(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `/api/favicon?domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}

function match(r: SearchResult, q: string): boolean {
  return `${r.name} ${r.tagline} ${r.category}`.toLowerCase().includes(q);
}

/** Grouped results for a query. `perGroup` caps each group (0 = unlimited). */
export function searchAll(query: string, perGroup = 0): Record<ResultKind, SearchResult[]> {
  const q = query.trim().toLowerCase();
  const out = { tool: [], mcp: [], skill: [], guide: [] } as Record<ResultKind, SearchResult[]>;
  if (!q) return out;
  for (const r of ALL_RESULTS) {
    if (match(r, q)) out[r.kind].push(r);
  }
  if (perGroup > 0) {
    for (const k of KIND_ORDER) out[k] = out[k].slice(0, perGroup);
  }
  return out;
}

export function totalResults(grouped: Record<ResultKind, SearchResult[]>): number {
  return KIND_ORDER.reduce((n, k) => n + grouped[k].length, 0);
}
