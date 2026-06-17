import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { callLLM } from "@/lib/llm";
import { getRadarFeed } from "@/lib/knowledge";
import { valueLinePrompt, parseValueLine } from "@/lib/radar";

// Generates the radar value-line for entities that need one, then caches it on
// the entity. Cron-triggered right after ingestion (see fetch-news.yml). Cost
// is bounded per run (batch cap) and self-drains across runs.
export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_BATCH = 20;
const MAX_BATCH = 40;
// Don't regenerate a line more than once every few days, even if the entity's
// best story changed — bounds cost when an active entity gets fresh stories
// every run.
const STALE_MS = 3 * 24 * 60 * 60 * 1000;

// Writer needs the service role — anon writes silently fail under RLS while
// still burning LLM calls, so hard-fail when the key is absent.
function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const secret =
    request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY required" }, { status: 500 });
  }

  const batch = Math.min(
    parseInt(request.nextUrl.searchParams.get("batch") ?? String(DEFAULT_BATCH), 10) || DEFAULT_BATCH,
    MAX_BATCH
  );

  // Radar-eligible entities + their best (headline-matched) story + line state.
  const feed = await getRadarFeed(21, 2, 80);
  const now = Date.now();
  const needsGen = feed
    .filter((it) => {
      if (!it.latestStory) return false; // no source story → nothing to ground a line in
      if (it.valueLineAt === null) return true; // never evaluated
      if (now - new Date(it.valueLineAt).getTime() < STALE_MS) return false; // fresh enough
      return it.valueLineStoryId !== it.latestStory.id; // stale AND a better story exists
    })
    .slice(0, batch);

  const admin = getAdmin();
  let shipped = 0;
  let held = 0;
  let failed = 0;
  const results: Array<{ name: string; status: "shipped" | "held" | "error"; line: string | null }> = [];

  // Sequential — concurrent bursts trip the free-tier rate limit, and a batch of
  // ~20 at ~4s each stays well under the 300s ceiling.
  for (const it of needsGen) {
    const story = it.latestStory!;
    try {
      const { text } = await callLLM(
        valueLinePrompt(it.entity.canonicalName, it.entity.entityType, story.title, story.summary),
        80
      );
      const { line, held: isHeld } = parseValueLine(text);
      await admin
        .from("entities")
        .update({
          value_line: line,
          value_line_story_id: story.id,
          value_line_at: new Date().toISOString(),
        })
        .eq("id", it.entity.id);
      if (isHeld) {
        held++;
        results.push({ name: it.entity.canonicalName, status: "held", line: null });
      } else {
        shipped++;
        results.push({ name: it.entity.canonicalName, status: "shipped", line });
      }
    } catch {
      failed++;
      results.push({ name: it.entity.canonicalName, status: "error", line: null });
    }
  }

  return Response.json({
    eligible: feed.length,
    needed: needsGen.length,
    shipped,
    held,
    failed,
    results,
  });
}
