// Entity canonicalisation for the knowledge graph.
//
// The ingestion LLM extracts entity names + types per story (see
// api/news/fetch). Those surface forms are noisy ("RAG", "Rag", "retrieval
// augmented generation" all mean one thing), so before upserting we canonicalise
// to a stable slug + display name. This is deterministic, in-code — never trust
// the LLM for slugs. A curated KNOWN map fixes the worst offenders; everything
// else falls back to slugify(). See [[insight-editorial-cards]] for the seed
// page spec these power.

export type EntityType = "model" | "tool" | "company" | "technique" | "concept";

export const ENTITY_TYPES: EntityType[] = [
  "model",
  "tool",
  "company",
  "technique",
  "concept",
];

// Concept/technique pages live at /learn; model/tool/company pages at /tools.
export function entityHref(entity: { slug: string; entityType: EntityType }): string {
  const base = entity.entityType === "technique" || entity.entityType === "concept"
    ? "/learn"
    : "/tools";
  return `${base}/${entity.slug}`;
}

// Raw shape the LLM emits in the ENTITIES line.
export interface ExtractedEntity {
  name: string;
  type: EntityType;
}

// Result of canonicalisation, ready to upsert.
export interface CanonicalEntity {
  slug: string;
  canonicalName: string;
  entityType: EntityType;
  alias: string; // lowercased surface form, merged into entities.aliases
}

interface KnownEntity {
  name: string;
  type: EntityType;
  aliases: string[];
  isSeed?: boolean;
}

// ── Curated canonical entities ──────────────────────────────────────────────
// The 15 isSeed concepts mirror supabase/migrations/0001_knowledge_base.sql.
// The rest are high-frequency hard cases where the surface form and the slug
// diverge or where type matters. Keep slugs lowercase-kebab.
const KNOWN: Record<string, KnownEntity> = {
  // ── Seeds (concepts/techniques → /learn) ──
  "rag": { name: "Retrieval-Augmented Generation", type: "technique", aliases: ["rag", "retrieval augmented generation", "retrieval-augmented generation"], isSeed: true },
  "embeddings": { name: "Embeddings", type: "concept", aliases: ["embedding", "embeddings", "vector embeddings"], isSeed: true },
  "vector-database": { name: "Vector Database", type: "concept", aliases: ["vector database", "vector db", "vector store"], isSeed: true },
  "fine-tuning": { name: "Fine-Tuning", type: "technique", aliases: ["fine tuning", "fine-tuning", "finetuning"], isSeed: true },
  "agents": { name: "AI Agents", type: "concept", aliases: ["agent", "agents", "ai agents", "ai agent", "agentic"], isSeed: true },
  "mcp": { name: "Model Context Protocol", type: "concept", aliases: ["mcp", "model context protocol"], isSeed: true },
  "quantization": { name: "Quantization", type: "technique", aliases: ["quantization", "quantisation", "quantized"], isSeed: true },
  "rlhf": { name: "RLHF", type: "technique", aliases: ["rlhf", "reinforcement learning from human feedback"], isSeed: true },
  "context-window": { name: "Context Window", type: "concept", aliases: ["context window", "context length"], isSeed: true },
  "diffusion-models": { name: "Diffusion Models", type: "concept", aliases: ["diffusion", "diffusion model", "diffusion models"], isSeed: true },
  "transformers": { name: "Transformers", type: "concept", aliases: ["transformer", "transformers", "transformer architecture"], isSeed: true },
  "inference": { name: "Inference", type: "concept", aliases: ["inference", "model inference"], isSeed: true },
  "prompt-engineering": { name: "Prompt Engineering", type: "technique", aliases: ["prompt engineering", "prompting"], isSeed: true },
  "mixture-of-experts": { name: "Mixture of Experts", type: "concept", aliases: ["mixture of experts", "moe", "mixture-of-experts"], isSeed: true },
  "chain-of-thought": { name: "Chain of Thought", type: "technique", aliases: ["chain of thought", "cot", "chain-of-thought"], isSeed: true },

  // ── Common companies (→ /tools) ──
  "openai": { name: "OpenAI", type: "company", aliases: ["openai", "open ai"] },
  "anthropic": { name: "Anthropic", type: "company", aliases: ["anthropic"] },
  "google-deepmind": { name: "Google DeepMind", type: "company", aliases: ["google deepmind", "deepmind"] },
  "meta-ai": { name: "Meta AI", type: "company", aliases: ["meta ai", "meta fair"] },
  "mistral": { name: "Mistral AI", type: "company", aliases: ["mistral", "mistral ai"] },
  "hugging-face": { name: "Hugging Face", type: "company", aliases: ["hugging face", "huggingface"] },
  "nvidia": { name: "Nvidia", type: "company", aliases: ["nvidia"] },

  // ── Common tools/frameworks (→ /tools) ──
  "langchain": { name: "LangChain", type: "tool", aliases: ["langchain", "lang chain"] },
  "llamaindex": { name: "LlamaIndex", type: "tool", aliases: ["llamaindex", "llama index", "gpt index"] },
  "ollama": { name: "Ollama", type: "tool", aliases: ["ollama"] },
  "vllm": { name: "vLLM", type: "tool", aliases: ["vllm"] },
  "pytorch": { name: "PyTorch", type: "tool", aliases: ["pytorch"] },
  "cursor": { name: "Cursor", type: "tool", aliases: ["cursor"] },

  // ── Common model families (→ /tools) ──
  "gpt-4": { name: "GPT-4", type: "model", aliases: ["gpt4", "gpt-4", "gpt 4"] },
  "claude": { name: "Claude", type: "model", aliases: ["claude"] },
  "gemini": { name: "Gemini", type: "model", aliases: ["gemini", "google gemini"] },
  "llama": { name: "Llama", type: "model", aliases: ["llama", "meta llama"] },
};

// Slugs of the foundational seed set, used by /learn generateStaticParams so
// the build never depends on the DB being reachable.
export const SEED_SLUGS: string[] = Object.entries(KNOWN)
  .filter(([, v]) => v.isSeed)
  .map(([slug]) => slug);

// Reverse index: every alias (and its slugified form) → canonical slug.
const ALIAS_INDEX: Record<string, string> = {};
for (const [slug, info] of Object.entries(KNOWN)) {
  ALIAS_INDEX[slug] = slug;
  for (const a of info.aliases) {
    const lower = a.toLowerCase().trim();
    ALIAS_INDEX[lower] = slug;
    const slugged = slugify(a);
    if (slugged) ALIAS_INDEX[slugged] = slug;
  }
}

// Deterministic slug: lowercase, strip accents, non-alphanumerics → dashes.
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Generic nouns the extractor sometimes emits as "entities" — never specific
// enough for the radar or a /tools page (a card reading "LLM" or "AI tool" is
// noise). Dropped at ingestion (canonicalize) and filtered at read time
// (getRadarFeed) so rows already in the DB are cleaned too. Deliberately does
// NOT include seed concepts like "agents"/"rag" — those are real /learn pages.
export const GENERIC_ENTITY_DENYLIST = new Set<string>([
  "ai", "a.i.", "artificial intelligence",
  "ml", "machine learning",
  "llm", "llms", "large language model", "large language models",
  "genai", "gen ai", "generative ai",
  "model", "models", "ai model", "ai models", "language model", "language models",
  "tool", "tools", "ai tool", "ai tools",
  "app", "apps", "ai app", "ai apps", "ai mode",
  "assistant", "assistants", "ai assistant", "ai assistants",
  "chatbot", "chatbots", "api", "apis", "sdk",
  "software", "platform", "technology", "framework", "startup", "startups",
]);

export function isGenericEntityName(name: string): boolean {
  return GENERIC_ENTITY_DENYLIST.has(name.trim().toLowerCase());
}

/**
 * Map a raw extracted entity to a stable canonical form. Returns null when the
 * name can't produce a usable slug (e.g. all punctuation) or is a generic,
 * non-specific term — caller skips it.
 */
export function canonicalize(rawName: string, rawType?: EntityType): CanonicalEntity | null {
  const trimmed = rawName.trim();
  if (!trimmed) return null;
  const alias = trimmed.toLowerCase();

  // Known alias hit → use its canonical slug/name/type (wins over the denylist).
  const knownSlug = ALIAS_INDEX[alias] ?? ALIAS_INDEX[slugify(trimmed)];
  if (knownSlug && KNOWN[knownSlug]) {
    const info = KNOWN[knownSlug];
    return { slug: knownSlug, canonicalName: info.name, entityType: info.type, alias };
  }

  // Generic noun, not a real named entity → drop it.
  if (GENERIC_ENTITY_DENYLIST.has(alias)) return null;

  const slug = slugify(trimmed);
  if (!slug) return null;

  const entityType: EntityType =
    rawType && ENTITY_TYPES.includes(rawType) ? rawType : "concept";
  return { slug, canonicalName: trimmed, entityType, alias };
}

/**
 * Parse the JSON array the ingestion LLM emits on the ENTITIES line. Tolerant
 * of malformed output — returns [] on any parse/validation failure (never trust
 * LLM JSON). Caps at 6, drops blanks and over-long names, defaults bad types to
 * "concept".
 */
export function parseExtractedEntities(raw: string | undefined | null): ExtractedEntity[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const out: ExtractedEntity[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (!name || name.length > 80) continue;
    const rawType = rec.type;
    const type: EntityType =
      typeof rawType === "string" && (ENTITY_TYPES as string[]).includes(rawType)
        ? (rawType as EntityType)
        : "concept";
    out.push({ name, type });
    if (out.length >= 6) break;
  }
  return out;
}
