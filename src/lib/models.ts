// ─── AI model comparison dataset ─────────────────────────────────────────────
// Powers /compare (the interactive matrix), the per-pair /compare/[a]-vs-[b]
// pages, and the embeddable widget. Fields are chosen to stay stable:
// family-level names, round context windows, qualitative price tiers, and a link
// to each provider's live pricing — so the page never asserts a volatile
// per-token price as fact. Update LAST_UPDATED when revised.
//
// Maintenance note: `name` is the family as people search for it; `currentVersion`
// names the release that family currently points at. When a provider ships a new
// version, edit `currentVersion` and LAST_UPDATED — that is the whole update.
// Resist putting minor versions in `name`; that is how this file went stale
// before (it shipped "GPT-4o" and "Gemini 2.5 Pro" as current into August 2026).
//
// On the `reasoning` category: in 2026 deliberate reasoning is mostly an effort
// setting on a frontier model, not a separate product. The category is kept for
// models whose whole pitch is reasoning-first.

export const LAST_UPDATED = "2026-08-14";

export type ModelCategory = "frontier" | "balanced" | "efficient" | "reasoning" | "open";

export type Modality = "text" | "vision" | "audio";

export interface AIModel {
  id: string;
  name: string;
  /** The release this family currently points at, when it differs from `name`. */
  currentVersion?: string;
  provider: string;
  providerUrl: string;
  pricingUrl: string;
  category: ModelCategory;
  /** Context window in thousands of tokens (round, well-known figures). */
  contextK: number;
  /** Qualitative cost tier, not a live price. $ = cheapest, $$$$ = frontier. */
  priceTier: "$" | "$$" | "$$$" | "$$$$" | "free";
  modalities: Modality[];
  openWeights: boolean;
  bestFor: string;
  strengths: string[];
}

export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  frontier: "Frontier",
  balanced: "Balanced",
  efficient: "Fast & cheap",
  reasoning: "Reasoning",
  open: "Open weights",
};

// Family-level entries. `name` is what people search for; exact minor versions
// live in `currentVersion` so this file ages gracefully.
export const MODELS: AIModel[] = [
  // ─── Frontier ──────────────────────────────────────────────────────────────
  {
    id: "claude-fable",
    name: "Claude Fable",
    currentVersion: "Fable 5",
    provider: "Anthropic",
    providerUrl: "https://www.anthropic.com/claude",
    pricingUrl: "https://www.anthropic.com/pricing",
    category: "frontier",
    contextK: 1000,
    priceTier: "$$$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "The ceiling — problems where being right matters more than the bill",
    strengths: ["Highest capability in the Claude line", "Long-horizon agentic work", "Deep code reasoning"],
  },
  {
    id: "claude-opus",
    name: "Claude Opus",
    currentVersion: "Opus 5",
    provider: "Anthropic",
    providerUrl: "https://www.anthropic.com/claude",
    pricingUrl: "https://www.anthropic.com/pricing",
    category: "frontier",
    contextK: 1000,
    priceTier: "$$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "Agentic coding and multi-step engineering work — near the ceiling, at half the price",
    strengths: ["Leads agentic benchmarks", "Best-in-class coding", "Reasoning-effort control"],
  },
  {
    id: "gpt-sol",
    name: "GPT-5.6 Sol",
    provider: "OpenAI",
    providerUrl: "https://openai.com",
    pricingUrl: "https://openai.com/api/pricing/",
    category: "frontier",
    contextK: 1000,
    priceTier: "$$$$",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "The strongest generalist — complex agentic and scientific work across modalities",
    strengths: ["Top overall benchmark scores", "Broadest ecosystem", "Native audio and vision"],
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    currentVersion: "3.1 Pro",
    provider: "Google",
    providerUrl: "https://deepmind.google/technologies/gemini/",
    pricingUrl: "https://ai.google.dev/pricing",
    category: "frontier",
    contextK: 1000,
    priceTier: "$$",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "Reasoning over very long inputs — whole codebases, long documents, video",
    strengths: ["Leads reasoning benchmarks", "Huge context", "Strong price for the tier"],
  },
  {
    id: "grok",
    name: "Grok",
    currentVersion: "4.6",
    provider: "xAI",
    providerUrl: "https://x.ai",
    pricingUrl: "https://docs.x.ai/docs/models",
    category: "frontier",
    contextK: 500,
    priceTier: "$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "Agentic coding with tool use, especially inside xAI's own tooling",
    strengths: ["Strong agentic tool use", "Four reasoning-effort levels", "Competitive price below 200K"],
  },

  // ─── Balanced ──────────────────────────────────────────────────────────────
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    currentVersion: "Sonnet 5",
    provider: "Anthropic",
    providerUrl: "https://www.anthropic.com/claude",
    pricingUrl: "https://www.anthropic.com/pricing",
    category: "balanced",
    contextK: 1000,
    priceTier: "$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "The default for most work — reads code like a senior engineer at a fair price",
    strengths: ["Strong coding", "Great price-to-quality", "Reliable tool use"],
  },
  {
    id: "gpt-terra",
    name: "GPT-5.6 Terra",
    provider: "OpenAI",
    providerUrl: "https://openai.com",
    pricingUrl: "https://openai.com/api/pricing/",
    category: "balanced",
    contextK: 1000,
    priceTier: "$$",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "Production workloads that need frontier-family quality without the flagship bill",
    strengths: ["Same context as Sol", "Mid-tier pricing", "Full OpenAI tooling"],
  },

  // ─── Fast & cheap ──────────────────────────────────────────────────────────
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    currentVersion: "3.7 Flash",
    provider: "Google",
    providerUrl: "https://deepmind.google/technologies/gemini/",
    pricingUrl: "https://ai.google.dev/pricing",
    category: "efficient",
    contextK: 1000,
    priceTier: "$",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "High-volume agent loops and prototyping — cheap enough to run constantly",
    strengths: ["Very cheap for its capability", "Large context", "Fast"],
  },
  {
    id: "gpt-luna",
    name: "GPT-5.6 Luna",
    provider: "OpenAI",
    providerUrl: "https://openai.com",
    pricingUrl: "https://openai.com/api/pricing/",
    category: "efficient",
    contextK: 1000,
    priceTier: "$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "Classification, routing, and extraction at volume",
    strengths: ["Cheapest in the GPT-5.6 family", "Frontier-family context", "Fast"],
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku",
    currentVersion: "Haiku 4.5",
    provider: "Anthropic",
    providerUrl: "https://www.anthropic.com/claude",
    pricingUrl: "https://www.anthropic.com/pricing",
    category: "efficient",
    contextK: 200,
    priceTier: "$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "High-volume, low-latency work where speed and cost matter most",
    strengths: ["Fast", "Cheap at scale", "Good for classification & extraction"],
  },

  // ─── Reasoning-first ───────────────────────────────────────────────────────
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    providerUrl: "https://www.deepseek.com",
    pricingUrl: "https://platform.deepseek.com",
    category: "reasoning",
    contextK: 128,
    priceTier: "$",
    modalities: ["text"],
    openWeights: true,
    bestFor: "Open reasoning at a fraction of the cost of closed reasoning models",
    strengths: ["Open weights", "Strong chain-of-thought", "Very cheap"],
  },

  // ─── Open weights ──────────────────────────────────────────────────────────
  {
    id: "kimi",
    name: "Kimi",
    currentVersion: "K3",
    provider: "Moonshot AI",
    providerUrl: "https://www.moonshot.ai",
    pricingUrl: "https://platform.moonshot.ai",
    category: "open",
    contextK: 1000,
    priceTier: "$",
    modalities: ["text", "vision"],
    openWeights: true,
    bestFor: "Frontier-adjacent quality you can self-host — the open model closest to the closed leaders",
    strengths: ["Open weights at frontier scale", "1M context", "Cheap to run via providers"],
  },
  {
    id: "qwen",
    name: "Qwen",
    provider: "Alibaba",
    providerUrl: "https://qwenlm.github.io",
    pricingUrl: "https://qwenlm.github.io",
    category: "open",
    contextK: 128,
    priceTier: "free",
    modalities: ["text", "vision"],
    openWeights: true,
    bestFor: "A strong open model for local use, especially good at coding for its size",
    strengths: ["Open weights", "Strong coding", "Efficient at small sizes"],
  },
  {
    id: "llama",
    name: "Llama",
    provider: "Meta",
    providerUrl: "https://www.llama.com",
    pricingUrl: "https://www.llama.com",
    category: "open",
    contextK: 128,
    priceTier: "free",
    modalities: ["text", "vision"],
    openWeights: true,
    bestFor: "Running locally or self-hosting — private, free to run, no vendor lock-in",
    strengths: ["Open weights", "Runs locally", "Largest open ecosystem"],
  },
  {
    id: "mistral",
    name: "Mistral",
    provider: "Mistral AI",
    providerUrl: "https://mistral.ai",
    pricingUrl: "https://mistral.ai/pricing",
    category: "open",
    contextK: 256,
    priceTier: "$",
    modalities: ["text", "vision"],
    openWeights: true,
    bestFor: "Efficient European open models for building without heavy lock-in",
    strengths: ["Open weights", "Efficient", "Good for on-prem"],
  },
];

export function formatContext(contextK: number): string {
  return contextK >= 1000 ? `${(contextK / 1000).toFixed(0)}M` : `${contextK}K`;
}

export const PRICE_TIER_LABEL: Record<AIModel["priceTier"], string> = {
  free: "Free tier",
  $: "Low cost",
  $$: "Moderate",
  $$$: "Premium",
  $$$$: "Frontier price",
};
