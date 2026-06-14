// Prompt builders + parsers for the automated explainer generator. Pure
// functions (no I/O) so they're trivial to reason about and reuse. The labeled
// output format mirrors the CATEGORY:/SUMMARY: line-parse approach already
// proven in the ingestion route — more robust than asking for JSON prose.

interface ContextStory {
  title: string;
  summary: string;
}

const SECTION_LABELS = ["DEFINITION", "WHY", "HOW", "CURRENT", "RELATED"];

// Extract one labeled section's body, stopping at the next known label or end.
function section(text: string, label: string): string {
  const re = new RegExp(
    `${label}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${SECTION_LABELS.join("|")}):|$)`,
    "i"
  );
  return text.match(re)?.[1]?.trim() ?? "";
}

export function buildExplainerPrompt(
  name: string,
  entityType: string,
  stories: ContextStory[]
): string {
  const context =
    stories.length > 0
      ? stories.map((s, i) => `[${i + 1}] ${s.title}\n${s.summary}`).join("\n\n")
      : "(no recent stories)";

  return `You are writing a calm, factual glossary entry for Kapyn, an AI/tech knowledge base for engineers, founders, and operators. Explain the ${entityType} "${name}".

CONTEXT — recent Kapyn news mentioning ${name}. Use it ONLY for the CURRENT section, and cite by [number]:
${context}

Rules:
- Plain English, present tense, active voice. No hype, no marketing, no emojis, no exclamation marks.
- Write from well-established facts. If the CONTEXT is thin or empty, keep CURRENT short or write "none" — never invent.
- Do not invent product names, numbers, dates, benchmarks, or companies that are not in the CONTEXT or common knowledge.
- Each section is 2-4 sentences. No markdown headers, no bullet points, no bold.

Respond in EXACTLY this labeled format, nothing before or after:
DEFINITION: <what ${name} is, in plain English>
WHY: <why it matters and to whom>
HOW: <how it works, accessibly>
CURRENT: <what is happening with ${name} now, grounded in the CONTEXT and citing [1], [2]; or "none">
RELATED: <up to 5 closely related concept or tool names, comma-separated>`;
}

export interface ParsedExplainer {
  definition: string;
  whyItMatters: string;
  howItWorks: string;
  currentDevelopments: string;
  related: string[];
}

export function parseExplainer(text: string): ParsedExplainer {
  let currentDevelopments = section(text, "CURRENT");
  if (/^none\.?$/i.test(currentDevelopments.trim())) currentDevelopments = "";

  const relatedRaw = section(text, "RELATED");
  const related = relatedRaw
    ? relatedRaw
        .split(/[,\n]/)
        .map((s) => s.replace(/^[-•\d.]+\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  return {
    definition: section(text, "DEFINITION"),
    whyItMatters: section(text, "WHY"),
    howItWorks: section(text, "HOW"),
    currentDevelopments,
    related,
  };
}

// ── Self-critique (quality gate) ────────────────────────────────────────────

export function buildCritiquePrompt(name: string, explainer: string): string {
  return `You are a strict fact-checker. Score this glossary entry about "${name}" from 0 to 100 on: factual accuracy, grounding (no invented specifics), specificity, and absence of filler or hallucination. If it states specific facts — numbers, dates, product claims — that are not common knowledge, score below 50. If it is vague or padded, score below 60.

ENTRY:
${explainer}

Respond in EXACTLY this format, nothing else:
SCORE: <integer 0-100>
VERDICT: <one short sentence>`;
}

export function parseCritique(text: string): { score: number; verdict: string } {
  const scoreMatch = text.match(/SCORE:\s*(\d{1,3})/i);
  const verdictMatch = text.match(/VERDICT:\s*([\s\S]+)/i);
  let score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  if (!Number.isFinite(score) || score < 0) score = 0;
  if (score > 100) score = 100;
  return { score, verdict: verdictMatch?.[1]?.trim().slice(0, 200) ?? "" };
}
