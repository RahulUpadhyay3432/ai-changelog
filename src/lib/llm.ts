// Shared LLM provider cascade for server-side generation: OpenRouter (free
// GLM-4.5-Air, fast + predictable) primary, Gemini 2.5 Flash Lite fallback.
// Mirrors the pattern in api/breakdown; centralised here for the knowledge
// generator. Both tiers are free, so marginal cost stays ~$0.

const OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";
const OPENROUTER_TIMEOUT_MS = 14_000;

export async function callOpenRouter(prompt: string, maxTokens = 800): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");
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
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!text) throw new Error("OpenRouter returned empty response");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;
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
export async function callLLM(prompt: string, maxTokens = 800): Promise<LLMResult> {
  try {
    return { text: await callOpenRouter(prompt, maxTokens), model: "glm-4.5-air" };
  } catch {
    return { text: await callGemini(prompt), model: "gemini-2.5-flash-lite" };
  }
}
