// Mappers: the source objects (RadarTool / RadarItem) → the normalized RadarThing
// the radar UI speaks in. Extracted here so both the Today feed (RadarClient) and
// the Browse catalog (BrowseClient) build their things the same way.

import type { RadarTool, RadarItem } from "@/lib/knowledge";
import type { CategorySlug } from "@/lib/types";
import { formatTimeAgo } from "@/lib/mock-data";
import type { Face, RadarThing } from "./radar-shared";

// Knowledge-graph entity type → the category accent its mark wears.
const ENTITY_CATEGORY: Record<string, CategorySlug> = {
  model: "ai-models",
  tool: "dev-tools",
  company: "big-tech",
  concept: "research",
  technique: "research",
};

// Trending GitHub / Product Hunt launch.
export function toolThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine,
    face: t.source === "producthunt" ? "producthunt" : "github",
    metric: t.meta, typeLabel: t.source === "producthunt" ? "Product Hunt" : "GitHub",
    category: null, url: t.url, recency: null, storyTitle: null, storySource: null,
  };
}

// Curated essential — filed by its `meta` bucket (e.g. "AI coding").
export function essThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "essential",
    metric: null, typeLabel: null, category: t.meta ?? "Essentials",
    url: t.url, recency: null, storyTitle: null, storySource: null,
  };
}

// Canonical open-source essential (most-starred OSS in the essentials set).
export function canonThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "github",
    metric: t.meta, typeLabel: "Open source", category: "Open source",
    url: t.url, recency: null, storyTitle: null, storySource: null,
    categorySlug: "open-source",
  };
}

// Knowledge-graph entity (model / tool / company / concept) with its latest story.
export function entThing(e: RadarItem): RadarThing {
  const n = e.entity.mentionCount;
  const et = e.entity.entityType;
  return {
    id: `entity:${e.entity.id}`, kind: "entity", name: e.entity.canonicalName, valueLine: e.valueLine ?? "",
    face: (["model", "tool", "company"].includes(et) ? et : "concept") as Face,
    metric: `${n} ${n === 1 ? "source" : "sources"}`,
    typeLabel: et.charAt(0).toUpperCase() + et.slice(1),
    category: et === "model" ? "Models" : et === "tool" ? "Tools" : et === "company" ? "Companies" : "Concepts",
    url: e.latestStory?.sourceUrl ?? null,
    recency: e.latestStory?.publishedAt ? formatTimeAgo(e.latestStory.publishedAt) : null,
    storyTitle: e.latestStory?.title ?? null,
    storySource: e.latestStory?.sourceName ?? null,
    // redesign plumbing: the cover image was being dropped here.
    imageUrl: e.latestStory?.imageUrl ?? null,
    entityId: e.entity.id,
    categorySlug: ENTITY_CATEGORY[et] ?? "research",
    metricValue: n,
  };
}
