// The LLM provider chain, shared by ingestion (/api/news/fetch) and the
// interactive "Why it matters" breakdown (/api/breakdown). It used to live inside
// the ingestion route, so the breakdown kept its own two-provider copy (OpenRouter
// free + Gemini) and broke on its own when both went down at once: OpenRouter's
// `:free` slug was retired (404) and Gemini's credits ran out (429), while the
// feed carried on through Cerebras/Z.ai/Groq. One chain, one place to fix it.

import { rotateKeys } from "@/lib/llm-rotate";
import { callOpenRouter } from "@/lib/llm";

const LLM_TIMEOUT_MS = 20_000; // bound a single provider call so a stall can't eat the run's time budget

// Retry transient LLM failures (rate limits / 5xx / network blips). Most "LLM
// failed — skipped" drops were a single 429 with no retry; a short exponential
// backoff clears them and stops silently shrinking the feed.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let a = 0; a < attempts; a++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const m = String(err);
      // Our own AbortSignal.timeout: a provider that stalled 20s will stall again, and
      // retrying it three times is what lets a late batch run past maxDuration.
      if (err instanceof Error && err.name === "TimeoutError") break;
      const transient =
        /\b(429|500|502|503|504)\b/.test(m) ||
        /fetch failed|timeout|ETIMEDOUT|ECONNRESET|overloaded|network/i.test(m);
      if (!transient || a === attempts - 1) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** a + Math.floor(Math.random() * 400)));
    }
  }
  throw lastErr;
}

/**
 * Read the text out of an OpenAI-compatible completion, rejecting a TRUNCATED
 * one.
 *
 * `finish_reason: "length"` means the model ran out of budget mid-answer, and a
 * half-written classify response is not a cheap version of a good one: it is
 * actively harmful, because the half that survives is the CATEGORY line and the
 * half that is lost is the SUMMARY. Parsing it produced a story with the feed's
 * default category and an empty summary, which is exactly what shipped blank
 * cards to the feed (measured 2026-10-03: 31 of 157 live rows).
 *
 * Returns null — "retryable, try the next key" — rather than throwing, so one
 * truncation can't retire a key or kill a provider.
 */
function readCompletion(data: {
  choices?: { message?: { content?: string }; finish_reason?: string }[];
}): string | null {
  const choice = data.choices?.[0];
  if (choice?.finish_reason === "length") return null;
  const text = (choice?.message?.content ?? "").trim();
  return text || null;
}

// DeepSeek's OpenAI-compatible endpoint. v4-flash is the cheap tier and is more
// than capable of classify-and-summarise; verified against the real prompt, its
// output parses with parseClassifyResponse unchanged.
async function callDeepSeek(prompt: string): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY missing");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = readCompletion(await res.json());
  if (!text) throw new Error("DeepSeek returned an empty or truncated response");
  return text;
}

/**
 * Groq leads the chain because its free tier allows roughly 1,000 requests a day per
 * key against OpenRouter free's ~50, and needs no card. The API is OpenAI-compatible,
 * so this is the DeepSeek call with a different base URL.
 *
 * GROQ_API_KEY holds a COMMA-SEPARATED list. The limits are per key, so three keys is
 * three times the daily allowance and three times the per-minute ceiling. Keys are
 * used round-robin from a rotating cursor rather than always starting at the first,
 * so a single run spreads across them instead of exhausting key one and spilling over.
 * A 429 or 413 moves to the next key; anything else is a real error and stops.
 *
 * Model: openai/gpt-oss-20b is on the 1,000/day tier and returns clean JSON for
 * classify-and-summarise in about a second. Check the current per-model allowance at
 * console.groq.com/docs/rate-limits before switching, because the cheap-looking models
 * are often the ones capped at 100/day.
 */
const groqCursor = { i: 0 };

function groqKeys(): string[] {
  return (process.env.GROQ_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}


/**
 * One attempt on one key. Returns null when the answer is retryable, throws when it
 * is not, so the caller can tell "wait and try again" from "this will never work".
 *
 * An empty 200 counts as retryable. gpt-oss occasionally returns a well-formed
 * response with no content, and the first live run lost 136 of 281 items to exactly
 * that, treating it as fatal when the same prompt succeeds on a second attempt.
 */
async function groqAttempt(key: string, prompt: string): Promise<string | null> {
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1600,
      temperature: 0.3,
      // gpt-oss is a REASONING model and the budget above is shared between its
      // thinking and its answer. Measured against the live prompt on 2026-10-03:
      // on a story it found hard to classify it spent 3,091 reasoning tokens and
      // emitted ZERO content tokens, so the parse got nothing. Raising the ceiling
      // alone does not help — at 1,600 it simply thought for 6,172 and truncated
      // again. Capping the effort is what fixes it: reasoning drops to 68-399
      // tokens and every response comes back complete.
      ...(/gpt-oss|reason/i.test(model)
        ? { reasoning_effort: process.env.GROQ_REASONING_EFFORT ?? "low" }
        : {}),
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (res.status === 429 || res.status === 413 || res.status >= 500) return null;
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return readCompletion(await res.json());
}

/**
 * Groq leads the chain: the free tier allows roughly 1,000 requests a day per key and
 * needs no card, against OpenRouter free's ~50. The API is OpenAI-compatible.
 *
 * GROQ_API_KEY holds a COMMA-SEPARATED list. Limits are per organisation, and these
 * keys are verified to sit in three different orgs, so three keys really is three
 * times the allowance rather than three names for one bucket. Worth re-checking if
 * keys are ever swapped: a 429 body names the org, so keys from one org would show
 * the same id and rotation would buy nothing.
 *
 * Rotation alone is not enough. The per-minute ceiling is what actually bites during
 * a bulk run, so each round tries every key and then backs off before trying again.
 * The first live run inserted 122 of 281 without this; the rest were bursts that gave
 * up instead of waiting a second.
 */
async function callGroq(prompt: string): Promise<string> {
  const keys = groqKeys();
  if (!keys.length) throw new Error("GROQ_API_KEY missing");
  return rotateKeys({ provider: "Groq", keys, cursor: groqCursor, attempt: groqAttempt, prompt });
}

async function callGemini(prompt: string): Promise<string> {
  // Overridable like the rest of the chain: a model name is the single most likely
  // thing to go stale, and a redeploy is the wrong unit of response to that.
  const model = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

/**
 * Mistral. OpenAI-compatible chat completions, same shape as Groq/DeepSeek.
 * MISTRAL_API_KEY holds a COMMA-SEPARATED list (two accounts here), rotated the same
 * way as Groq's keys so one account's rate limit doesn't stall the whole provider.
 */
const mistralCursor = { i: 0 };

function mistralKeys(): string[] {
  return (process.env.MISTRAL_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function mistralAttempt(key: string, prompt: string): Promise<string | null> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL ?? "open-mistral-nemo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (res.status === 429 || res.status === 413 || res.status >= 500) return null;
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return readCompletion(await res.json());
}

async function callMistral(prompt: string): Promise<string> {
  const keys = mistralKeys();
  if (!keys.length) throw new Error("MISTRAL_API_KEY missing");
  return rotateKeys({ provider: "Mistral", keys, cursor: mistralCursor, attempt: mistralAttempt, prompt });
}

/**
 * DeepInfra. OpenAI-compatible chat completions, same shape as Groq/Mistral.
 * DEEPINFRA_API_KEY holds a COMMA-SEPARATED list (five accounts here), rotated the
 * same way as Groq's keys so one account's balance/rate limit doesn't stall the
 * whole provider. A 402 (no balance) is treated like a 429 — try the next key
 * rather than aborting the provider outright, since accounts get topped up
 * independently of each other.
 */
const deepinfraCursor = { i: 0 };

function deepinfraKeys(): string[] {
  return (process.env.DEEPINFRA_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function deepinfraAttempt(key: string, prompt: string): Promise<string | null> {
  const res = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.DEEPINFRA_MODEL ?? "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (res.status === 429 || res.status === 402 || res.status === 413 || res.status >= 500) return null;
  if (!res.ok) throw new Error(`DeepInfra ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return readCompletion(await res.json());
}

async function callDeepInfra(prompt: string): Promise<string> {
  const keys = deepinfraKeys();
  if (!keys.length) throw new Error("DEEPINFRA_API_KEY missing");
  return rotateKeys({ provider: "DeepInfra", keys, cursor: deepinfraCursor, attempt: deepinfraAttempt, prompt });
}

/**
 * Cerebras. OpenAI-compatible, and the fastest tier in the chain by a wide margin
 * (wafer-scale inference, typically sub-second for a summary this size), which is
 * why it sits ahead of Groq: a 150-story run is latency-bound, not quality-bound.
 *
 * CEREBRAS_API_KEY holds a COMMA-SEPARATED list, rotated exactly like Groq's.
 *
 * CEREBRAS_MODEL is an override because the default slug below is UNVERIFIED from
 * this repo: the keys could not be tested when this was written. Verify before
 * trusting it, with `npm run verify:llm` or:
 *   curl -s https://api.cerebras.ai/v1/models -H "Authorization: Bearer $KEY" \
 *     | jq -r '.data[].id'
 * A wrong slug here surfaces as a 404, which is NOT retryable and will mark the
 * provider dead for the run — the same failure that silently killed OpenRouter
 * twice (see llm.ts). That is the intended behaviour: fail loudly, not per story.
 */
const cerebrasCursor = { i: 0 };

function cerebrasKeys(): string[] {
  return (process.env.CEREBRAS_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function cerebrasAttempt(key: string, prompt: string): Promise<string | null> {
  const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.CEREBRAS_MODEL ?? "llama-3.3-70b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (res.status === 429 || res.status === 413 || res.status >= 500) return null;
  if (!res.ok) throw new Error(`Cerebras ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return readCompletion(await res.json());
}

async function callCerebras(prompt: string): Promise<string> {
  const keys = cerebrasKeys();
  if (!keys.length) throw new Error("CEREBRAS_API_KEY missing");
  return rotateKeys({ provider: "Cerebras", keys, cursor: cerebrasCursor, attempt: cerebrasAttempt, prompt });
}

/**
 * Z.ai (GLM), called DIRECTLY rather than through OpenRouter. This matters: the
 * chain has twice tried to reach GLM via OpenRouter's free pool and twice broken
 * when the `:free` slug was retired out from under it (z-ai/glm-4.5-air:free, then
 * z-ai/glm-5.2:free). A first-party key is not subject to that churn.
 *
 * ZAI_API_KEY holds a COMMA-SEPARATED list, rotated like the others. Z.ai keys are
 * `{id}.{secret}` — the whole string is the bearer token, dot included.
 *
 * ZAI_MODEL default is UNVERIFIED from this repo for the same reason as Cerebras.
 * glm-4-flash is the cheap/fast tier; glm-4.6 is the strong one if quota allows.
 */
const zaiCursor = { i: 0 };

function zaiKeys(): string[] {
  return (process.env.ZAI_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function zaiAttempt(key: string, prompt: string): Promise<string | null> {
  const res = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.ZAI_MODEL ?? "glm-4-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (res.status === 429 || res.status === 413 || res.status >= 500) return null;
  if (!res.ok) throw new Error(`Z.ai ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return readCompletion(await res.json());
}

async function callZai(prompt: string): Promise<string> {
  const keys = zaiKeys();
  if (!keys.length) throw new Error("ZAI_API_KEY missing");
  return rotateKeys({ provider: "Z.ai", keys, cursor: zaiCursor, attempt: zaiAttempt, prompt });
}
// Ordered provider chain. Cheapest first; each is skipped when its key is absent.
//
// This is a chain rather than one provider because a single-provider summariser
// is a single point of failure for the entire feed: when Gemini's prepaid credits
// ran out on ~2026-08-11, ingestion kept fetching stories and dropping every one
// of them for eleven days. Any one provider can now go down without freezing the
// feed.
//
// "Add keys, not conditionals" used to be the advice here, and it was wrong often
// enough to be worth correcting. Audited 2026-10-02: of five configured providers,
// four were failing for reasons no key could fix, and all four reported as some
// flavour of "exhausted", which reads like spent quota:
//   mistral    `mistral-small-latest` is provisioned at 0 req/min on the free plan,
//              so every key 429s forever. A model/plan mismatch, not a limit.
//   deepinfra  402 no balance, mapped to retryable, so it looked like a rate limit.
//   openrouter 404, a retired model slug. Not a quota error at all.
//   gemini     429 credits depleted. The only genuine limit of the four.
// Adding keys to any of those changes nothing and costs ROUNDS x keys round trips
// per story. Before adding a key, read the real status code: the provider errors
// now carry the response body for exactly this reason.
// Ordered best-first. The last entry is the one that keeps the feed alive when the
// paid tiers are dry, which is not hypothetical: on 2026-09-04 every run for two days
// pulled ~306 items and inserted zero, because DeepSeek returned 402 Insufficient
// Balance and Gemini 429 prepayment credits depleted, at the same time. A free tier at
// the end of the chain turns a total outage into a quality dip. callOpenRouter was
// already in the repo on a free model and already used by the knowledge generator; it
// just was not wired in here.
export type LLMProvider = { name: string; envKey: string; call: (p: string) => Promise<string> };

export const LLM_PROVIDERS: LLMProvider[] = [
  { name: "cerebras", envKey: "CEREBRAS_API_KEY", call: callCerebras },
  { name: "zai-glm", envKey: "ZAI_API_KEY", call: callZai },
  { name: "groq-gpt-oss", envKey: "GROQ_API_KEY", call: callGroq },
  { name: "deepseek-v4-flash", envKey: "DEEPSEEK_API_KEY", call: callDeepSeek },
  { name: "gemini-flash-lite", envKey: "GEMINI_API_KEY", call: callGemini },
  { name: "mistral-small", envKey: "MISTRAL_API_KEY", call: callMistral },
  { name: "deepinfra-llama-8b", envKey: "DEEPINFRA_API_KEY", call: callDeepInfra },
  { name: "openrouter-free", envKey: "OPENROUTER_API_KEY", call: (prompt) => callOpenRouter(prompt) },
];
