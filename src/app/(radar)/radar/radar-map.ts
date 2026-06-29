// Mappers: the source objects (RadarTool / RadarItem) → the normalized RadarThing
// the radar UI speaks in. Extracted here so both the Today feed (RadarClient) and
// the Browse catalog (BrowseClient) build their things the same way.

import type { RadarTool, RadarItem } from "@/lib/knowledge";
import type { CategorySlug } from "@/lib/types";
import { formatTimeAgo } from "@/lib/mock-data";
import type { Face, RadarThing } from "./radar-shared";

// github.com first-path segments that are product/marketing pages, NOT user or
// org logins — so we don't ask for a (non-existent) "features" / "marketplace"
// avatar. These fall back to the GitHub domain favicon (the recognizable mark),
// which is right for GitHub's own products like Copilot (github.com/features/copilot).
const GH_RESERVED = new Set([
  "features", "marketplace", "about", "pricing", "enterprise", "sponsors",
  "topics", "collections", "explore", "readme", "security", "team", "solutions",
  "resources", "customer-stories", "login", "join", "new", "settings", "apps",
  "orgs", "organizations", "notifications", "contact", "site", "github",
]);

// Real brand logo for a tool, via the same-origin /api/favicon proxy (never
// beacons the hostname from the client). GitHub repos use the org avatar; GitHub
// product pages and other sites use the domain favicon; PH launch URLs have no
// usable logo here (the stored PH thumbnail is used instead).
export function logoFor(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "github.com") {
      const owner = u.pathname.split("/").filter(Boolean)[0];
      // A real owner/org → its avatar; a reserved product path (or no path) →
      // the GitHub mark itself, never a broken `?github=features` request.
      if (owner && !GH_RESERVED.has(owner.toLowerCase())) {
        return `/api/favicon?github=${encodeURIComponent(owner)}`;
      }
      return `/api/favicon?domain=github.com`;
    }
    if (host === "producthunt.com" || host.endsWith(".producthunt.com")) return null;
    return `/api/favicon?domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}

// Well-known AI brand → official domain. Knowledge-graph entities (models, labs,
// companies) only carry a *news-story* URL, so logoFor() on that would return the
// publisher's favicon. Instead we match the entity's name to its brand domain and
// use that favicon — a real logo. No match → null (no mark, never a stray image).
// Order matters: most specific first. Edit freely; this is editorial.
const BRAND_DOMAIN: [RegExp, string][] = [
  [/\bchatgpt\b|\bopenai\b|\bgpt[-\s]?\d|\bgpt\b|\bo[134]\b|\bsora\b|\bcodex\b|\bdall[-\s]?e\b/i, "openai.com"],
  [/\banthropic\b|\bclaude\b/i, "anthropic.com"],
  [/\bgemini\b|\bdeepmind\b|\bgemma\b|\bveo\b|\bimagen\b|\bbard\b|\bgoogle\b/i, "google.com"],
  [/\bllama\b|\bmeta\s?ai\b|\bmeta\b/i, "meta.com"],
  [/\bmistral\b|\bmixtral\b|\bcodestral\b/i, "mistral.ai"],
  [/\bgrok\b|\bxai\b|\bx\.ai\b/i, "x.ai"],
  [/\bdeepseek\b/i, "deepseek.com"],
  [/\bqwen\b|\balibaba\b/i, "qwen.ai"],
  [/\bkimi\b|\bmoonshot\b/i, "moonshot.ai"],
  [/\bcopilot\b|\bphi[-\s]?\d|\bmicrosoft\b|\bazure\b/i, "microsoft.com"],
  [/\bnvidia\b|\bnemotron\b/i, "nvidia.com"],
  [/\bcohere\b|\bcommand[-\s]?r\b/i, "cohere.com"],
  [/\bperplexity\b/i, "perplexity.ai"],
  [/\bhugging\s?face\b/i, "huggingface.co"],
  [/\bstability\b|\bstable[-\s]?diffusion\b/i, "stability.ai"],
  [/\bgithub\b/i, "github.com"],
  [/\bvercel\b/i, "vercel.com"],
  [/\bcursor\b/i, "cursor.com"],
  [/\breplit\b/i, "replit.com"],
  [/\bhubspot\b/i, "hubspot.com"],
  [/\bnotion\b/i, "notion.so"],
  [/\bfigma\b/i, "figma.com"],
  [/\bslack\b/i, "slack.com"],
  [/\btailscale\b/i, "tailscale.com"],
  [/\bsupabase\b/i, "supabase.com"],
  [/\bstripe\b/i, "stripe.com"],
  [/\bnetflix\b/i, "netflix.com"],
  [/\bamazon\b|\baws\b/i, "amazon.com"],
  [/\bapple\b/i, "apple.com"],
  [/\bsalesforce\b/i, "salesforce.com"],
  [/\bibm\b|\bgranite\b/i, "ibm.com"],
  [/\bsnowflake\b/i, "snowflake.com"],
  [/\bdatabricks\b/i, "databricks.com"],
  [/\boracle\b/i, "oracle.com"],
  [/\bintel\b/i, "intel.com"],
  [/\bamd\b/i, "amd.com"],
  [/\bsamsung\b/i, "samsung.com"],
  [/\btesla\b/i, "tesla.com"],
  [/\buber\b/i, "uber.com"],
  [/\bspotify\b/i, "spotify.com"],
];

// Brand logo for a knowledge-graph entity, matched by name (not its news URL).
export function brandLogoFor(name: string | null | undefined): string | null {
  if (!name) return null;
  for (const [re, domain] of BRAND_DOMAIN) {
    if (re.test(name)) return `/api/favicon?domain=${domain}`;
  }
  return null;
}

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
  [/video|avatar|text-to-video|motion-graphics|filmmaking/i, "Video"],
  [/voice|speech|audio|music|podcast|dubbing|text-to-speech|sound/i, "Voice & audio"],
  [/image|photo|generative-art|text-to-image|diffusion|illustration|logo-maker/i, "Image"],
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
  "Data & RAG", "Inference", "Dev tools",
  "Video", "Voice & audio", "Image", "Marketing & content",
  "Eval & observability", "New on GitHub", "New on Product Hunt",
];

// A small emoji per category — UI wayfinding only (never in summary content).
// Makes categories scannable at a glance and adds warmth without loud color.
const CATEGORY_EMOJI: Record<string, string> = {
  "AI coding": "⌨️",
  "Dev tools": "🛠️",
  "UI & design": "🎨",
  "Agents & automation": "🤖",
  "Orchestration": "🔀",
  "Models & chat": "🧠",
  "AI / Models": "🧠",
  "Inference": "⚡",
  "Data & RAG": "🗄️",
  "Security": "🔒",
  "Eval & observability": "📊",
  "Media": "🎬",
  "Video": "🎥",
  "Voice & audio": "🎙️",
  "Image": "🖼️",
  "Marketing & content": "📣",
  "Open source": "📦",
  "MCP": "🔌",
  "New on GitHub": "🐙",
  "New on Product Hunt": "🚀",
  // Browse-catalog buckets (entities + trending)
  "Models": "🧠",
  "Tools": "🛠️",
  "Companies": "🏢",
  "Concepts": "💡",
  "New & trending": "📡",
};

export function categoryEmoji(category: string | null | undefined): string {
  if (!category) return "✨";
  return CATEGORY_EMOJI[category] ?? "✨";
}

// Same-origin cover image for a tool's site (og:image → screenshot → gradient).
// CoverImage falls back to the category gradient if this 204s / fails to load.
function ogProxy(url: string | null | undefined): string | null {
  return url ? `/api/og-image?url=${encodeURIComponent(url)}` : null;
}

// Trending GitHub / Product Hunt launch.
export function toolThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine,
    face: t.source === "producthunt" ? "producthunt" : "github",
    metric: t.meta, typeLabel: t.source === "producthunt" ? "Product Hunt" : "GitHub",
    category: categorizeTool(t.topics, t.source), url: t.url, recency: null,
    storyTitle: null, storySource: null,
    description: t.description ?? null, topics: t.topics,
    imageUrl: t.imageUrl ?? ogProxy(t.url),
    logoUrl: t.imageUrl ?? logoFor(t.url),
  };
}

// Curated essential — filed by its `meta` bucket (e.g. "AI coding").
export function essThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "essential",
    metric: null, typeLabel: null, category: t.meta ?? "Essentials",
    url: t.url, recency: null, storyTitle: null, storySource: null,
    description: t.description ?? null, topics: t.topics,
    imageUrl: ogProxy(t.url),
    logoUrl: logoFor(t.url),
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
    imageUrl: ogProxy(t.url),
    logoUrl: logoFor(t.url),
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
    // Real brand logo from the entity's name (its URL is a news article, so
    // logoFor() there would give the publisher's favicon, not the brand's).
    logoUrl: brandLogoFor(e.entity.canonicalName),
    entityId: e.entity.id,
    categorySlug: ENTITY_CATEGORY[et] ?? "research",
    metricValue: n,
  };
}
