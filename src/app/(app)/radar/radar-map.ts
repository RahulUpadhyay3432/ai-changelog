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

// Trending tools arrive with no curated category — so saving them all landed in
// one "Saved" bucket. Derive a real builder-domain category from the source
// topics (Product Hunt / GitHub), so saves file themselves. First match wins;
// order matters (most specific → most generic).
const TOPIC_CATEGORY: [RegExp, string][] = [
  [/security|appsec|sast|secret|vuln|auth\b|authentication|compliance/i, "Security"],
  [/agent|autonomous|crew|multi-?agent|orchestrat|workflow|automation|rpa/i, "Agents & automation"],
  [/design|ui\b|ux\b|css|tailwind|component|front-?end|figma|website-builder|no-?code/i, "UI & design"],
  [/rag\b|vector|embedding|database|postgres|semantic-search|retrieval|knowledge-base/i, "Data & RAG"],
  [/inference|serving|gpu|deploy|hosting|fine-?tun/i, "Inference"],
  [/eval|observability|monitoring|tracing|analytics|logging/i, "Eval & observability"],
  [/voice|speech|image|video|audio|music|avatar|generative-art|text-to-/i, "Media"],
  [/dev-?tool|developer-tools|sdk|cli\b|api\b|framework|library|productivity/i, "Dev tools"],
  [/llm|language-model|gpt|chatbot|machine-learning|\bml\b|\bai\b|artificial-intelligence/i, "AI / Models"],
];

export function categorizeTool(topics: string[], source: RadarTool["source"]): string {
  for (const topic of topics) {
    for (const [re, cat] of TOPIC_CATEGORY) {
      if (re.test(topic)) return cat;
    }
  }
  return source === "producthunt" ? "New on Product Hunt" : "New on GitHub";
}

// Preferred pill order for the "What's new" category filter (most builder-
// relevant first). Categories not listed fall to the end, alphabetically.
export const WHATS_NEW_CATEGORY_ORDER = [
  "Agents & automation", "Security", "UI & design", "AI / Models",
  "Data & RAG", "Inference", "Dev tools", "Media", "Eval & observability",
  "New on GitHub", "New on Product Hunt",
];

// Trending GitHub / Product Hunt launch.
export function toolThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine,
    face: t.source === "producthunt" ? "producthunt" : "github",
    metric: t.meta, typeLabel: t.source === "producthunt" ? "Product Hunt" : "GitHub",
    category: categorizeTool(t.topics, t.source), url: t.url, recency: null,
    storyTitle: null, storySource: null,
    description: t.description ?? null, topics: t.topics,
  };
}

// Curated essential — filed by its `meta` bucket (e.g. "AI coding").
export function essThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "essential",
    metric: null, typeLabel: null, category: t.meta ?? "Essentials",
    url: t.url, recency: null, storyTitle: null, storySource: null,
    description: t.description ?? null, topics: t.topics,
  };
}

// Canonical open-source essential (most-starred OSS in the essentials set).
export function canonThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "github",
    metric: t.meta, typeLabel: "Open source", category: "Open source",
    url: t.url, recency: null, storyTitle: null, storySource: null,
    categorySlug: "open-source",
    description: t.description ?? null, topics: t.topics,
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
