// ─── AI model comparison dataset ─────────────────────────────────────────────
// Powers /compare (the interactive matrix) and its embeddable widget. Fields are
// chosen to stay stable: family-level names, round context windows, qualitative
// price tiers, and a link to each provider's live pricing — so the page never
// asserts a volatile per-token price as fact. Update LAST_UPDATED when revised.

export const LAST_UPDATED = "2026-07-01";

export type ModelCategory = "frontier" | "balanced" | "efficient" | "reasoning" | "open";

export type Modality = "text" | "vision" | "audio";

export interface AIModel {
  id: string;
  name: string;
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

// Family-level entries. Names match how the rest of Kapyn's content refers to
// these models; exact minor versions are omitted deliberately to avoid staleness.
export const MODELS: AIModel[] = [
  {
    id: "claude-opus",
    name: "Claude Opus",
    provider: "Anthropic",
    providerUrl: "https://www.anthropic.com/claude",
    pricingUrl: "https://www.anthropic.com/pricing",
    category: "frontier",
    contextK: 200,
    priceTier: "$$$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "The hardest reasoning, long agentic tasks, and code that has to be right",
    strengths: ["Best-in-class coding", "Long-horizon agentic work", "Careful instruction-following"],
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    providerUrl: "https://www.anthropic.com/claude",
    pricingUrl: "https://www.anthropic.com/pricing",
    category: "balanced",
    contextK: 200,
    priceTier: "$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "The default for most work — reads code like a senior engineer at a fair price",
    strengths: ["Strong coding", "Great price-to-quality", "Reliable tool use"],
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku",
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
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerUrl: "https://openai.com",
    pricingUrl: "https://openai.com/api/pricing/",
    category: "frontier",
    contextK: 128,
    priceTier: "$$$",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "A strong all-rounder with native voice and vision in one model",
    strengths: ["Multimodal incl. audio", "Broad ecosystem", "Fast for a frontier model"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    providerUrl: "https://openai.com",
    pricingUrl: "https://openai.com/api/pricing/",
    category: "efficient",
    contextK: 128,
    priceTier: "$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "Cheap, fast, high-volume tasks like extraction and classification",
    strengths: ["Very cheap", "Fast", "Good enough for the boring high-throughput work"],
  },
  {
    id: "openai-o-series",
    name: "OpenAI o-series",
    provider: "OpenAI",
    providerUrl: "https://openai.com",
    pricingUrl: "https://openai.com/api/pricing/",
    category: "reasoning",
    contextK: 128,
    priceTier: "$$$$",
    modalities: ["text", "vision"],
    openWeights: false,
    bestFor: "Multi-step reasoning, math, and problems that reward slow thinking",
    strengths: ["Deep reasoning", "Strong on math & logic", "Shows its working"],
  },
  {
    id: "gemini-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    providerUrl: "https://deepmind.google/technologies/gemini/",
    pricingUrl: "https://ai.google.dev/pricing",
    category: "frontier",
    contextK: 1000,
    priceTier: "$$$",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "Huge-context work — whole codebases, long documents, video reasoning",
    strengths: ["Massive context window", "Strong multimodal", "Good value at the frontier"],
  },
  {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    providerUrl: "https://deepmind.google/technologies/gemini/",
    pricingUrl: "https://ai.google.dev/pricing",
    category: "efficient",
    contextK: 1000,
    priceTier: "free",
    modalities: ["text", "vision", "audio"],
    openWeights: false,
    bestFor: "Prototyping and high-volume work — capable, fast, with a usable free tier",
    strengths: ["Generous free tier", "Large context", "Fast"],
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
    strengths: ["Open weights", "Runs locally", "Strong ecosystem"],
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
    strengths: ["Open weights", "Strong reasoning", "Very cheap"],
  },
  {
    id: "mistral",
    name: "Mistral",
    provider: "Mistral AI",
    providerUrl: "https://mistral.ai",
    pricingUrl: "https://mistral.ai/pricing",
    category: "open",
    contextK: 128,
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
