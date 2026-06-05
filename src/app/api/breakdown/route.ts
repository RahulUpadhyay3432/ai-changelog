import { NextRequest, NextResponse } from "next/server";

// Allow enough time for the free model (~7s) plus a fallback hop.
export const maxDuration = 30;

// Per-IP rate limit: 10 requests per minute
const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// Prune stale entries every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap.entries()) {
    if (now > entry.resetAt) ipMap.delete(ip);
  }
}, 5 * 60_000);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.summary !== "string") {
    return NextResponse.json({ error: "Missing title or summary" }, { status: 400 });
  }

  const { title, summary } = body;
  if (!title.trim() || !summary.trim()) {
    return NextResponse.json({ error: "Missing title or summary" }, { status: 400 });
  }

  const prompt = `You are explaining a tech/AI news story to someone smart but not a specialist. Be concise and direct.

Headline: "${title}"
Summary: "${summary}"

Respond in exactly this format:

[2-3 sentences explaining what this is in plain English]

Why it matters: [1-2 sentences on the real-world significance or impact]

Rules:
- Use **bold** around 3-5 key technical terms, company names, or numbers that are most important
- No headers, no bullet points, no other markdown
- Bold only the most signal-rich words, not common words`;

  try {
    // Primary: OpenRouter (Nemotron). Fallback: Gemini.
    let text: string;
    try {
      text = await callOpenRouter(prompt);
    } catch (primaryErr) {
      console.warn("[breakdown] OpenRouter failed, falling back to Gemini:", primaryErr);
      text = await callGemini(prompt);
    }
    if (!text) throw new Error("Empty response from both providers");
    return NextResponse.json({ explanation: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Breakdown API error:", message);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}

// ── LLM providers ────────────────────────────────────────────────────────────
// Primary: GLM-4.5-Air (free, ~7s, clean output, non-reasoning so latency is
// predictable). Fallback: Gemini. Nemotron-550B was rejected — ~3.7 min/call.
const OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";

async function callOpenRouter(prompt: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      // Nemotron is a reasoning model — needs headroom for hidden reasoning
      // tokens plus the answer, or `content` comes back empty.
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("OpenRouter returned empty response");
  return text;
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}
