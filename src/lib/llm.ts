// Shared LLM provider cascade for server-side generation: OpenRouter (free
// GLM-4.5-Air, fast + predictable) primary, Gemini Flash Lite (latest) fallback.
// Mirrors the pattern in api/breakdown; centralised here for the knowledge
// generator. Both tiers are free, so marginal cost stays ~$0.

// This slug has now been retired from under us TWICE: z-ai/glm-4.5-air:free, then its
// replacement z-ai/glm-5.2:free (confirmed absent from the live model list on
// 2026-10-02 — the 404 in the ingestion logs). Hence the env override: the next
// retirement should be a Vercel config change, not a deploy. Re-check with
//   curl -s https://openrouter.ai/api/v1/models | jq -r '.data[].id' | grep ':free'
//
// The default was chosen by testing the real classify prompt against every live free
// model on 2026-10-02. Most of the free pool is now REASONING models, which is the
// second half of the bug: at the old 800-token ceiling they spent the whole budget
// thinking and returned finish_reason:"length" with no CATEGORY:/SUMMARY: markers at
// all, so parseClassifyResponse got nothing. Raising the ceiling fixes them. Results:
//   inclusionai/ling-3.0-flash-sante:free   3s, 424 tok, 39 words, clean   ← default
//   qwen/qwen3.8-27b:free                  41s, 1687 tok, 46 words, clean (too slow)
//   google/gemma-4-*-it:free               429 from the provider, repeatedly
//   thinkingmachines/inkling-small:free    403, age-verified accounts only
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "inclusionai/ling-3.0-flash-sante:free";

// 30s, up from 14s: a reasoning model needs room to finish thinking before it emits
// the format. The user-facing breakdown route keeps its own short timeout, because
// there a slow answer is worse than a fallback.
const OPENROUTER_TIMEOUT_MS = 30_000;

// OPENROUTER_API_KEY is a COMMA-SEPARATED list, matching GROQ/MISTRAL/DEEPINFRA.
// It used to be read as a single bearer token, so pasting a list here produced
// `Bearer key1,key2,key3` and a 401 on every call.
//
// Free-model daily caps are per ACCOUNT, not per key, so rotation is only worth
// real extra quota when the keys sit on separate accounts. Rahul confirmed on
// 2026-10-03 that these do, which is what makes the full round-robin below pay
// rather than just spreading retries over one shared bucket.
let openrouterCursor = 0;

function openrouterKeys(): string[] {
  return (process.env.OPENROUTER_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * One attempt on one key. null means "retryable, try the next key"; a throw means
 * the whole provider is wrong and no key will save it.
 *
 * The free pool 429s constantly from upstream congestion (measured 2026-10-02:
 * both Gemma variants 429'd repeatedly across different keys), so a 429 must mean
 * "next account", not "give up". 404 throws instead, because a retired model slug
 * is identical on every key and rotating through five of them to learn that is
 * exactly the waste this module already paid for twice.
 */
async function openrouterAttempt(
  key: string,
  prompt: string,
  maxTokens: number
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (res.status === 429 || res.status === 413 || res.status >= 500) return null;
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    return text || null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Rotates every key before giving up, the same shape as callGroq. Previously this
 * picked ONE key per call and threw, so the only rotation came from withRetry's
 * three attempts: with four keys configured, the fourth was never reached on a
 * burst, and a single 429 spent a whole retry instead of moving to the next
 * account. ROUNDS x keys fixes both.
 */
export async function callOpenRouter(prompt: string, maxTokens = 2500): Promise<string> {
  const keys = openrouterKeys();
  if (!keys.length) throw new Error("OPENROUTER_API_KEY missing");

  const ROUNDS = 3;
  for (let round = 0; round < ROUNDS; round++) {
    for (let i = 0; i < keys.length; i++) {
      const idx = (openrouterCursor + i) % keys.length;
      const text = await openrouterAttempt(keys[idx], prompt, maxTokens);
      if (text) {
        openrouterCursor = (idx + 1) % keys.length;
        return text;
      }
    }
    // Every account was limited this round: wait out the per-minute window.
    if (round < ROUNDS - 1) await new Promise((r) => setTimeout(r, 1500 * (round + 1)));
  }
  throw new Error(`OpenRouter: ${keys.length} key(s) exhausted after ${ROUNDS} rounds`);
}

export async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  // Overridable for the same reason as every other model in the chain: a slug is
  // the likeliest thing to go stale and a redeploy is the wrong response to that.
  const model = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

export interface LLMResult {
  text: string;
  model: string;
}

// Primary → fallback. Returns which model produced the text (provenance).
export async function callLLM(prompt: string, maxTokens = 2500): Promise<LLMResult> {
  try {
    // Provenance is read from the constant, not hardcoded: it previously claimed
    // "glm-4.5-air" for two slugs after that model stopped existing.
    return { text: await callOpenRouter(prompt, maxTokens), model: OPENROUTER_MODEL };
  } catch {
    return {
      text: await callGemini(prompt),
      model: process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest",
    };
  }
}
