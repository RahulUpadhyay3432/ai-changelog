// Shared content-quality filters for the ingestion + knowledge pipelines.
//
// isBadSummary was originally inline in api/news/fetch; it's lifted here so the
// knowledge generator reuses the exact same battle-tested gate. Never let raw
// or low-signal LLM output reach the UI (CLAUDE.md).

/**
 * Detects summaries that must never reach the feed.
 * Catches both exact sentinels (LOW_SIGNAL, OFF_TOPIC) and the prose
 * variations the LLM sometimes writes instead of the sentinel word.
 */
export function isBadSummary(text: string): boolean {
  const t = text.trim();
  const lower = t.toLowerCase();
  return (
    // Exact sentinels
    t === "LOW_SIGNAL" ||
    lower.startsWith("low_signal") ||
    t === "OFF_TOPIC" ||
    lower.startsWith("off_topic") ||
    // Prose off-topic: LLM writes "This content is not related to AI..."
    // instead of the OFF_TOPIC sentinel
    lower.includes("not related to ai") ||
    lower.includes("not related to ml") ||
    lower.includes("not related to software") ||
    lower.includes("not related to tech") ||
    lower.includes("this content is not") ||
    lower.includes("not about ai") ||
    lower.includes("not about tech") ||
    // Prompt-forbidden openers — when the LLM uses these it signals generic
    // or off-topic content (the prompt explicitly bans them for real stories)
    lower.startsWith("this article") ||
    lower.startsWith("this post") ||
    lower.startsWith("this blog") ||
    // Leaked prompt / boilerplate
    lower.startsWith("write a ") ||
    lower.startsWith("the provided content") ||
    lower.includes("summarize this article") ||
    /^release:\s/i.test(t) ||
    /\btags:\s*[\w,\s]+$/.test(t) ||
    /refs\s+\S+#\d+/i.test(t) ||
    /^v?\d+\.\d+[\w.]*\s*[-–]\s*/i.test(t)
  );
}

// Phrases that mean the model leaked its scaffolding or refused — an explainer
// section containing any of these is unpublishable.
const EXPLAINER_LEAKS = [
  "as an ai",
  "i cannot",
  "i can't",
  "i'm unable",
  "the provided context",
  "the context provided",
  "the context does not",
  "based on the context",
  "based on the sources",
  "the sources provided",
  "the above context",
  "insufficient information",
  "i don't have enough",
  "no information is available",
  "cannot determine",
  "definition:",
  "why it matters:",
  "how it works:",
];

/**
 * A single explainer section is "bad" if it's empty, too short to be useful,
 * reuses the summary sentinels, or leaks prompt scaffolding / a refusal.
 * `minWords` defaults to 6 — enough to reject one-liners and fragments.
 */
export function isBadExplainerSection(text: string, minWords = 6): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < minWords) return true;
  if (isBadSummary(t)) return true;
  const lower = t.toLowerCase();
  return EXPLAINER_LEAKS.some((p) => lower.includes(p));
}

// ─── Markdown / em-dash sanitising ──────────────────────────────────────────

/**
 * Strips the formatting that smaller open models emit despite the prompt
 * forbidding it, so their output can be used without reading as machine-written.
 *
 * This exists because the provider chain's cheap tiers are the ones that ignore
 * style instructions. `open-mistral-nemo`, `ministral-8b` and most of
 * OpenRouter's free pool emit `**bold**` and em dashes on roughly every third
 * summary; nothing downstream removed them, so the choice was a markdown-leaking
 * card or dropping the story. Sanitising is the third option.
 *
 * Deliberately NOT a general markdown renderer: a summary is 2-4 sentences of
 * plain prose, so anything structural (headings, lists, code fences) is a sign
 * the model ignored the format and belongs in isBadSummary's hands, not here.
 */
export function sanitizeSummary(text: string): string {
  return (
    (text ?? "")
      // Emphasis: **bold**, __bold__, *italic*, _italic_, `code`.
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,;:!?)]|$)/g, "$1$2")
      .replace(/(^|\s)_([^_\n]+)_(?=\s|[.,;:!?)]|$)/g, "$1$2")
      .replace(/`([^`\n]+)`/g, "$1")
      // Em/en dash → comma. CLAUDE.md's voice rules ban them and the prompt says
      // so explicitly; a comma is what the prompt asks for as the replacement.
      .replace(/\s*[—–]\s*/g, ", ")
      // A leaked "SUMMARY:" label, which happens when a model repeats the format.
      .replace(/^\s*SUMMARY:\s*/i, "")
      // Collapse the punctuation the dash swap can double up (", ," → ",").
      .replace(/,\s*([,.;:])/g, "$1")
      .replace(/([.;:])\s*,/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}
