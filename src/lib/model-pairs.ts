// ─── Head-to-head model comparisons ──────────────────────────────────────────
// Powers /compare/[a]-vs-[b]. Deliberately CURATED, not generated: 15 models
// would permute into 105 pages, and ~85 of them ("Llama vs Mistral for vision")
// are doorway pages nobody searches for. We ship the matchups people actually
// type, each with a hand-written verdict — the same editorial standard as
// radar-tool-depth.ts.
//
// Voice: present tense, name the real tradeoff, no hype, no emoji. If a pair has
// no honest "it depends", it does not belong here.

import { MODELS, type AIModel } from "./models";

export interface ModelPair {
  /** Model ids from MODELS, in canonical (url) order. */
  a: string;
  b: string;
  /** The honest one-paragraph tradeoff. This is the page's reason to exist. */
  verdict: string;
  /** Concrete cases where each side wins. */
  pickA: string[];
  pickB: string[];
}

export const MODEL_PAIRS: ModelPair[] = [
  {
    a: "claude-opus",
    b: "gpt-sol",
    verdict:
      "The headline matchup, and closer than either vendor's marketing suggests. GPT-5.6 Sol edges ahead on the overall benchmark snapshot; Claude Opus 5 leads on agentic and coding work. Sol is the better generalist across modalities, Opus the better engineer. At this point the deciding factor is usually which ecosystem your code already lives in, not raw capability.",
    pickA: [
      "Multi-step agentic coding where the model runs for a long time without supervision",
      "Large refactors that must respect an existing codebase's conventions",
      "You want reasoning-effort control to trade cost against depth",
    ],
    pickB: [
      "One model for text, vision and audio in the same pipeline",
      "You are already deep in OpenAI tooling and want the least migration friction",
      "General knowledge and scientific work rather than shipping code",
    ],
  },
  {
    a: "claude-opus",
    b: "gemini-pro",
    verdict:
      "Two different bets. Opus 5 is the agentic specialist, it holds a task together over many steps. Gemini 3.1 Pro leads reasoning benchmarks and costs meaningfully less per token at the frontier tier. Both carry a million-token context, so the old 'Gemini for long inputs' advantage has largely evaporated.",
    pickA: [
      "Agent loops that call tools repeatedly and must not drift",
      "Code that has to match an existing house style",
    ],
    pickB: [
      "Hard reasoning problems where you want the benchmark leader",
      "Cost-sensitive frontier work. It is the cheaper of the two",
      "Video and audio reasoning in the same request",
    ],
  },
  {
    a: "gpt-sol",
    b: "gemini-pro",
    verdict:
      "Sol is the stronger all-round generalist; Gemini 3.1 Pro is the better value and the reasoning-benchmark leader. Both handle roughly a million tokens of context and all three modalities, so this comes down to price sensitivity and which cloud you already pay.",
    pickA: [
      "You want the top overall scores and the widest third-party ecosystem",
      "Audio-native workflows",
    ],
    pickB: [
      "The same tier of capability at a lower price",
      "Reasoning-heavy analysis",
      "You are already on Google Cloud or Workspace",
    ],
  },
  {
    a: "claude-opus",
    b: "grok",
    verdict:
      "Both are pitched at agentic coding. Opus 5 has the deeper track record and twice the context; Grok 4.6 is cheaper below 200K tokens and offers four reasoning-effort levels instead of three. Grok's catch is the long-context toll: cross 200K and the rate doubles for every token in the request, including the ones below the line.",
    pickA: [
      "Long sessions that will exceed 200K tokens, no pricing cliff",
      "Work where the coding track record matters more than the price",
    ],
    pickB: [
      "Short-context agentic tasks where the lower rate compounds",
      "You want an xhigh reasoning setting for occasional hard problems",
    ],
  },
  {
    a: "gpt-sol",
    b: "grok",
    verdict:
      "Sol is the safer default and scores higher overall; Grok 4.6 matches it on some agentic work at a fraction of the short-context price. Grok is the newer and less proven of the two, it shipped in August 2026 , so treat it as the value play rather than the reliable one.",
    pickA: [
      "Production work where maturity and ecosystem matter",
      "Requests that routinely run long",
    ],
    pickB: [
      "High-volume agentic coding under 200K tokens",
      "You want to cut model spend without dropping to a small model",
    ],
  },
  {
    a: "gemini-pro",
    b: "grok",
    verdict:
      "Similar price band, different shapes. Gemini 3.1 Pro brings a million-token context, three modalities and the reasoning-benchmark lead. Grok 4.6 brings stronger built-in tool use and a 500K window that gets expensive past 200K. Gemini is the more general instrument; Grok is tuned for agents.",
    pickA: [
      "Long documents, video, or audio in the prompt",
      "Pure reasoning tasks",
    ],
    pickB: [
      "Agent workflows leaning hard on tool calls",
      "Working inside Grok Build or xAI's own surfaces",
    ],
  },
  {
    a: "claude-sonnet",
    b: "gpt-terra",
    verdict:
      "The workhorse tier, where most production traffic actually runs. Both sit around the same price and both inherit their family's million-token context. Sonnet 5 keeps Claude's habit of matching an existing codebase; Terra keeps OpenAI's ecosystem breadth and audio support. For most teams this is a coin flip decided by existing integrations.",
    pickA: [
      "Code generation inside an established repo",
      "Long conditional instructions that must be followed exactly",
    ],
    pickB: [
      "Mixed text, image and audio workloads",
      "You want one vendor for the whole GPT-5.6 tier ladder",
    ],
  },
  {
    a: "claude-sonnet",
    b: "gemini-pro",
    verdict:
      "A tier-crossing comparison people make on price. Gemini 3.1 Pro is a frontier model at roughly balanced-tier cost, which makes it genuinely competitive with Sonnet 5 on budget. Sonnet still wins on instruction-following discipline and code that fits its surroundings; Gemini wins on raw reasoning.",
    pickA: [
      "Agentic coding and tool use you want to be predictable",
      "Strict adherence to a long system prompt",
    ],
    pickB: [
      "More reasoning capability for a similar spend",
      "Multimodal inputs",
    ],
  },
  {
    a: "claude-fable",
    b: "claude-opus",
    verdict:
      "The within-Claude question. Fable 5 is the ceiling and costs twice Opus 5. Opus 5 landed in July 2026 delivering near-Fable capability at half the price, which made Fable a specialist rather than a default. Start on Opus and escalate only when you can point at a task it actually fails.",
    pickA: [
      "The genuinely hardest problems where being right dominates cost",
      "Work you cannot easily verify yourself",
    ],
    pickB: [
      "Almost everything else. It is the better price-to-capability trade",
      "High-volume agentic work where the 2x multiplier compounds",
    ],
  },
  {
    a: "claude-opus",
    b: "claude-sonnet",
    verdict:
      "The one most Claude users get wrong by defaulting up. Sonnet 5 handles the large majority of real work at a fraction of Opus 5's price, with the same million-token context. Opus earns its cost on long autonomous runs and architectural reasoning, not on the routine edits people usually point it at.",
    pickA: [
      "Long agent runs with no human in the loop",
      "Architecture decisions and gnarly debugging",
    ],
    pickB: [
      "Day-to-day coding, editing and refactoring",
      "Anything you run at volume",
    ],
  },
  {
    a: "gpt-sol",
    b: "gpt-terra",
    verdict:
      "Same family, same million-token context, different price and depth. Sol is the flagship for complex agentic and scientific work; Terra is the production tier that most workloads should default to. OpenAI cut Terra's price in July 2026, widening the gap and making the case for starting low.",
    pickA: [
      "Problems where the extra capability changes the outcome",
      "Research-grade or scientific reasoning",
    ],
    pickB: [
      "Production traffic at scale",
      "Anything where you would notice the flagship bill",
    ],
  },
  {
    a: "claude-haiku",
    b: "gemini-flash",
    verdict:
      "The cheap tier, where the shape of the job matters more than the leaderboard. Gemini 3.7 Flash carries a million-token context and is priced to run constantly, which makes it the better agent workhorse. Haiku 4.5 caps at 200K but stays inside the Claude family, so prompts and tool definitions port cleanly from Sonnet.",
    pickA: [
      "You already run Claude and want one prompt style across tiers",
      "Latency-sensitive classification",
    ],
    pickB: [
      "Cheap agent loops that need real context",
      "Long inputs on a small budget",
    ],
  },
  {
    a: "gpt-luna",
    b: "gemini-flash",
    verdict:
      "Both are built for volume, and both got materially cheaper in 2026, OpenAI cut Luna's price by 80% in July, Google shipped 3.7 Flash in August. Luna inherits the GPT-5.6 context window and OpenAI's tooling; Flash is the stronger agent runner. Benchmark them on your own traffic, because at this price tier the differences are workload-specific.",
    pickA: [
      "You are standardising on the GPT-5.6 ladder",
      "Routing and classification inside an OpenAI stack",
    ],
    pickB: [
      "Agent loops that call tools repeatedly",
      "Squeezing the lowest cost per useful completion",
    ],
  },
  {
    a: "claude-haiku",
    b: "gpt-luna",
    verdict:
      "Two small models with different context budgets. Luna inherits the full GPT-5.6 window; Haiku 4.5 stops at 200K. If you are doing short, high-frequency tasks the difference rarely shows up, pick the one whose family you already use and stop optimising.",
    pickA: [
      "Extraction and classification inside a Claude pipeline",
      "You want vision on a small model",
    ],
    pickB: [
      "Long inputs at the cheapest tier",
      "High-volume routing in an OpenAI stack",
    ],
  },
  {
    a: "claude-opus",
    b: "kimi",
    verdict:
      "Closed frontier against the open model that got closest to it. Kimi K3 ships open weights at roughly 2.8 trillion parameters with a million-token context. You can self-host it, which Opus 5 will never allow. Opus is still ahead on agentic reliability, but the gap is now small enough that data-residency or lock-in concerns can decide this outright.",
    pickA: [
      "Agentic work where reliability is the whole point",
      "You want a vendor with a support relationship",
    ],
    pickB: [
      "Data that cannot leave your infrastructure",
      "Avoiding vendor lock-in on principle",
      "Running at a scale where per-token pricing stops making sense",
    ],
  },
  {
    a: "gpt-sol",
    b: "kimi",
    verdict:
      "The open-versus-closed question at the top of the market. Sol scores higher and comes with the largest ecosystem; Kimi K3 is open-weight, comparable in context, and dramatically cheaper to run through a provider or on your own hardware. In 2026 the open models are close enough that this is a deployment decision, not a capability one.",
    pickA: [
      "Best available generalist quality with no ops burden",
      "Audio and vision in one model",
    ],
    pickB: [
      "Self-hosting, on-prem, or strict data residency",
      "Very high volume where the token bill dominates",
    ],
  },
  {
    a: "deepseek",
    b: "kimi",
    verdict:
      "Two open models with different centres of gravity. DeepSeek is reasoning-first and extremely cheap; Kimi K3 is the bigger all-rounder with far more context. If you are picking one open model to self-host in 2026, K3 is the more general answer, but DeepSeek remains hard to beat on cost per solved reasoning problem.",
    pickA: [
      "Chain-of-thought reasoning on a tight budget",
      "Smaller footprint to run",
    ],
    pickB: [
      "One open model to cover most workloads",
      "Long-context work",
    ],
  },
  {
    a: "deepseek",
    b: "qwen",
    verdict:
      "Both are cheap, capable and open. DeepSeek leans reasoning; Qwen leans coding and multilingual work, and its smaller sizes run comfortably on modest hardware. For local experimentation Qwen is usually the easier starting point.",
    pickA: [
      "Math, logic and multi-step reasoning",
      "You want visible chain-of-thought",
    ],
    pickB: [
      "Coding on consumer hardware",
      "Non-English work, especially Chinese",
    ],
  },
  {
    a: "llama",
    b: "qwen",
    verdict:
      "The two default local models. Llama has the largest open ecosystem, more tooling, quantisations and fine-tunes than anything else , while Qwen tends to punch above its parameter count on code. Ecosystem versus raw quality per gigabyte.",
    pickA: [
      "Maximum tooling and community support",
      "Existing fine-tunes you want to build on",
    ],
    pickB: [
      "Better coding for the same model size",
      "Multilingual output",
    ],
  },
  {
    a: "llama",
    b: "mistral",
    verdict:
      "Both are open and self-hostable; Llama wins on ecosystem breadth, Mistral on efficiency and European data governance. Mistral's larger context also makes it the easier fit for document-heavy on-prem work.",
    pickA: [
      "The widest selection of tooling and community fine-tunes",
      "You want the most-documented path",
    ],
    pickB: [
      "On-prem deployments with EU data requirements",
      "Longer inputs without leaving the open tier",
    ],
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

const BY_ID = new Map<string, AIModel>(MODELS.map((m) => [m.id, m]));

export function modelById(id: string): AIModel | undefined {
  return BY_ID.get(id);
}

/** Canonical url slug for a pair, e.g. "claude-opus-vs-gpt-sol". */
export function pairSlug(pair: ModelPair): string {
  return `${pair.a}-vs-${pair.b}`;
}

/** Resolve a slug in either order, so /gpt-sol-vs-claude-opus still finds it. */
export function getPair(slug: string): { pair: ModelPair; reversed: boolean } | undefined {
  const direct = MODEL_PAIRS.find((p) => pairSlug(p) === slug);
  if (direct) return { pair: direct, reversed: false };
  const flipped = MODEL_PAIRS.find((p) => `${p.b}-vs-${p.a}` === slug);
  return flipped ? { pair: flipped, reversed: true } : undefined;
}

/** Other curated pairs that involve either model — used for internal linking. */
export function relatedPairs(pair: ModelPair, limit = 6): ModelPair[] {
  return MODEL_PAIRS.filter(
    (p) => p !== pair && (p.a === pair.a || p.b === pair.a || p.a === pair.b || p.b === pair.b),
  ).slice(0, limit);
}
