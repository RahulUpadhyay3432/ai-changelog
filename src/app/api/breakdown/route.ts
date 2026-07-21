import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Allow enough time for the free model (~7s) plus a fallback hop.
export const maxDuration = 30;

// Per-IP limit. Higher than a pure click-rate because the client prefetches
// breakdowns for upcoming cards while scrolling. Enforced via Upstash so it
// holds across serverless instances (an in-memory Map does not).
const RATE_LIMIT = 30;
const RATE_WINDOW_SECONDS = 60;

// Each uncached breakdown spends an LLM call, so cap input size: a request with a
// huge title/summary would amplify token cost per call. Real Kapyn copy is a
// short headline + 2-3 sentence summary, so these are generous.
const MAX_TITLE = 300;
const MAX_SUMMARY = 2000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { ok } = await rateLimit({
    key: `breakdown:${ip}`,
    limit: RATE_LIMIT,
    windowSeconds: RATE_WINDOW_SECONDS,
  });
  if (!ok) {
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
  const id = typeof body.id === "string" ? body.id : null;
  if (!title.trim() || !summary.trim()) {
    return NextResponse.json({ error: "Missing title or summary" }, { status: 400 });
  }
  if (title.length > MAX_TITLE || summary.length > MAX_SUMMARY) {
    return NextResponse.json({ error: "Title or summary too long" }, { status: 400 });
  }

  // DB cache: a real (non-mock) story may already have a stored breakdown —
  // generated once on first view, then served instantly to everyone forever.
  const cacheable = id !== null && !id.startsWith("mock-");
  if (cacheable) {
    const cached = await readCachedBreakdown(id);
    if (cached) return NextResponse.json({ explanation: cached, cached: true });
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
    // Persist so the next view (any user, any session) is instant. Best-effort,
    // awaited so it completes before the serverless function freezes.
    if (cacheable) await storeBreakdown(id, text);
    return NextResponse.json({ explanation: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Breakdown API error:", message);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}

// ── DB cache (news_items.breakdown) ──────────────────────────────────────────
function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Service role for writes; anon still allows the read if service key is unset.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readCachedBreakdown(id: string): Promise<string | null> {
  try {
    const db = getDbClient();
    if (!db) return null;
    const { data, error } = await db
      .from("news_items")
      .select("breakdown")
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    const b = data?.breakdown;
    return typeof b === "string" && b.trim() ? b : null;
  } catch {
    return null;
  }
}

async function storeBreakdown(id: string, breakdown: string): Promise<void> {
  try {
    const db = getDbClient();
    if (!db) return;
    await db.from("news_items").update({ breakdown }).eq("id", id);
  } catch {
    /* best-effort cache — never block the response on a write failure */
  }
}

// ── LLM providers ────────────────────────────────────────────────────────────
// Primary: GLM-4.5-Air (free, ~7s, clean output, non-reasoning so latency is
// predictable). Fallback: Gemini. Nemotron-550B was rejected — ~3.7 min/call.
const OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";

// Free-tier latency is variable (usually ~7s, but can spike). Abort if it runs
// long so we fall back to Gemini fast instead of burning the whole budget and
// 504-ing — the fallback otherwise only triggers on a hard error, not slowness.
const OPENROUTER_TIMEOUT_MS = 14_000;

async function callOpenRouter(prompt: string): Promise<string> {
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
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!text) throw new Error("OpenRouter returned empty response");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${key}`;
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
