// Radar value-line generation — the "what this lets you do" line that is the
// radar's entire value. Prompt + parser are kept PURE (no LLM call) so they're
// reusable and testable, mirroring lib/knowledge-prompt.ts. The generation
// route wires callLLM around these.

// Reframe a news story about an entity into the action/value for a developer.
// The hold rules implement the brief's "don't ship mush" principle: thin or
// pure-company-news context produces no line rather than generic filler.
export function valueLinePrompt(name: string, type: string, title: string, summary: string): string {
  return `You write the single "why a builder should care" line shown on a radar of what's new in AI. Reframe news into what a developer can DO.

Entity: ${name} (${type})
Recent context:
"${title}"
${summary}

Write ONE line, max 14 words, telling a developer what ${name} lets them DO or why it matters for their work, the action/value, not the announcement.
Rules:
- Verb-first where natural. Concrete and specific.
- No hype, no exclamation marks, no marketing adjectives.
- Do not restate the headline; extract the value.
- Reply with exactly INSUFFICIENT if the context is too thin, OR if it is merely news ABOUT the entity (funding, partnerships, spending, hiring, valuation) rather than a capability, tool, or release a developer can actually use.

Good examples:
- Serves 70B models on one consumer GPU , cuts inference cost
- Edits across files in agent mode , faster refactors
- Open-source coding model you can self-host

Value line:`;
}

export interface ParsedValueLine {
  line: string | null; // null = held back (thin or non-actionable)
  held: boolean;
}

const MAX_VALUE_LINE = 140;

// Clean the model output and detect the held-back signal. Never trusts the LLM
// to be well-formed — strips a leaked "Value line:" prefix, list bullets, and
// quotes, collapses to a single line, and caps length.
export function parseValueLine(raw: string): ParsedValueLine {
  const cleaned = raw
    .replace(/^value line:\s*/i, "")
    .replace(/^[-*"']\s*/, "")
    .trim();
  const oneLine = cleaned.split(/\r?\n/)[0].trim().replace(/["']$/, "");
  if (!oneLine || /^insufficient\b/i.test(oneLine)) return { line: null, held: true };
  return { line: oneLine.slice(0, MAX_VALUE_LINE), held: false };
}
