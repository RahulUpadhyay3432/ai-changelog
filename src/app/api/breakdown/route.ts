import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { LLM_PROVIDERS } from "@/lib/llm-providers";

// Room for a couple of provider hops; generateBreakdown stops starting new ones at
// BREAKDOWN_BUDGET_MS so the route answers before this ceiling.
export const maxDuration = 60;

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

  // ⚠️  Anything PERSISTED must be generated from the stored row, never from the
  // request body. This endpoint is unauthenticated, so a caller could otherwise
  // POST an arbitrary `title`/`summary` alongside a real story's `id`, and the
  // resulting text would be written to that row with the service-role key and
  // then served from cache to every future reader. Body values are still fine
  // for one-off, uncached responses (mock stories in dev).
  let promptTitle = title;
  let promptSummary = summary;
  let persistable = false;
  if (cacheable) {
    const row = await readStoryForPrompt(id);
    if (row) {
      promptTitle = row.title;
      promptSummary = row.summary;
      persistable = true;
    }
  }

  const prompt = `You are explaining a tech/AI news story to someone smart but not a specialist. Be concise and direct.

Headline: "${promptTitle}"
Summary: "${promptSummary}"

Respond in exactly this format:

[2-3 sentences explaining what this is in plain English]

Why it matters: [1-2 sentences on the real-world significance or impact]

Rules:
- Use **bold** around 3-5 key technical terms, company names, or numbers that are most important
- No headers, no bullet points, no other markdown
- Bold only the most signal-rich words, not common words`;

  try {
    const text = await generateBreakdown(prompt);
    // Persist so the next view (any user, any session) is instant. Best-effort,
    // awaited so it completes before the serverless function freezes.
    if (persistable && id) await storeBreakdown(id, text);
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

/**
 * The story's own title/summary, straight from the table. This is the trusted
 * input for anything we intend to persist.
 */
async function readStoryForPrompt(id: string): Promise<{ title: string; summary: string } | null> {
  try {
    const db = getDbClient();
    if (!db) return null;
    const { data, error } = await db
      .from("news_items")
      .select("title, summary")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const t = typeof data.title === "string" ? data.title.trim() : "";
    const sm = typeof data.summary === "string" ? data.summary.trim() : "";
    return t && sm ? { title: t.slice(0, MAX_TITLE), summary: sm.slice(0, MAX_SUMMARY) } : null;
  } catch {
    return null;
  }
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
// The same chain as ingestion (@/lib/llm-providers). This route used to carry its
// own OpenRouter-free + Gemini pair, and on 2026-10-16 both were down at once (the
// `:free` slug 404s, Gemini 429s on depleted credits) while the feed was fine, so
// every uncached "Why it matters" tap returned a 500.
//
// No retries here, unlike ingestion: a user is waiting, so a failing provider gets
// one try and we move on, and no new provider starts once the budget is spent.
const BREAKDOWN_BUDGET_MS = 40_000;
// Per-provider cap. Without it one stalled provider spent the whole budget: on
// 2026-10-16 Z.ai's rate-limited keys ran out the 40s before Groq, Gemini or
// Mistral (all working) were ever tried. A healthy provider answers in ~1-5s.
const PROVIDER_BUDGET_MS = 8_000;

async function generateBreakdown(prompt: string): Promise<string> {
  const deadline = Date.now() + BREAKDOWN_BUDGET_MS;
  const errors: string[] = [];
  for (const provider of LLM_PROVIDERS) {
    if (!process.env[provider.envKey]) continue;
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const text = await Promise.race([
        provider.call(prompt),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("timed out")),
            Math.min(remaining, PROVIDER_BUDGET_MS)
          );
        }),
      ]);
      if (text.trim()) return text.trim();
      errors.push(`${provider.name}: empty`);
    } catch (err) {
      errors.push(`${provider.name}: ${String(err).slice(0, 160)}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`All providers failed: ${errors.join(" | ") || "none configured"}`);
}
