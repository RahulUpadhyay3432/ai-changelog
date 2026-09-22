import { createClient } from "@supabase/supabase-js";
import type { CategorySlug } from "@/lib/types";
import { isAuthorizedHermes } from "@/lib/hermes-auth";
import { isBadSummary } from "@/lib/quality";
import { parseExtractedEntities } from "@/lib/entities";
import { persistStory, VALID_SLUGS } from "@/lib/news-ingest";
import { getPostHogClient } from "@/lib/posthog-server";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

const MAX_HERMES_ATTEMPTS = 3;
const MIN_SUMMARY_LEN = 80;
const MAX_SUMMARY_LEN = 900;

type BacklogRow = {
  id: string;
  source_url: string;
  title: string;
  source_name: string;
  image_url: string | null;
  published_at: string;
  status: string;
  hermes_attempts: number;
  is_test: boolean;
  news_item_id: string | null;
};

// GET /api/hermes/results?task_id=<id> — read-only status check, used by
// HERMES to reconcile a submission whose HTTP response it never saw (e.g. the
// connection dropped after Kapyn had already persisted the story).
export async function GET(request: Request) {
  if (!isAuthorizedHermes(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const taskId = url.searchParams.get("task_id");
  if (!taskId) {
    return Response.json({ error: "task_id required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from("ingest_backlog")
    .select("status")
    .eq("id", taskId)
    .maybeSingle();

  if (!row) {
    return Response.json({ error: "unknown task" }, { status: 404 });
  }
  return Response.json({ status: row.status });
}

export async function POST(request: Request) {
  if (!isAuthorizedHermes(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as {
    run_id?: unknown;
    result?: { task_id?: unknown; kind?: unknown; output?: Record<string, unknown> };
  };
  const taskId = typeof b.result?.task_id === "string" ? b.result.task_id : null;
  const output = b.result?.output;
  if (!taskId || !output || typeof output !== "object") {
    return Response.json({ error: "result.task_id and result.output are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const posthog = getPostHogClient();

  const { data: row } = await supabase
    .from("ingest_backlog")
    .select("id, source_url, title, source_name, image_url, published_at, status, hermes_attempts, is_test, news_item_id")
    .eq("id", taskId)
    .maybeSingle<BacklogRow>();

  if (!row) {
    return Response.json({ error: "unknown task" }, { status: 404 });
  }

  // Idempotent replay: HERMES may retry a submission it never got a response
  // for. Same task, already finished → same answer, no re-validation.
  if (row.status === "done") {
    return Response.json({ accepted: true, news_item_id: row.news_item_id, duplicate: true });
  }
  if (row.status !== "pending") {
    return Response.json(
      { accepted: false, reason: `task is ${row.status}, not pending` },
      { status: 409 }
    );
  }

  // ── Validate the submitted output — Kapyn is the gatekeeper, never trust
  // HERMES's planner output blindly. Any failure bumps hermes_attempts; the
  // task is rejected outright at MAX_HERMES_ATTEMPTS so a broken planner can't
  // poll the same task forever.
  const rawCategory = typeof output.category === "string" ? output.category : "";
  const summary = typeof output.summary === "string" ? output.summary.trim() : "";
  const entities = parseExtractedEntities(JSON.stringify((output.entities as unknown) ?? []));

  const reasons: string[] = [];
  if (!VALID_SLUGS.includes(rawCategory as CategorySlug)) {
    reasons.push(`invalid category "${rawCategory}"`);
  }
  if (isBadSummary(summary)) {
    reasons.push("summary is LOW_SIGNAL/OFF_TOPIC or otherwise unpublishable");
  } else if (summary.length < MIN_SUMMARY_LEN || summary.length > MAX_SUMMARY_LEN) {
    reasons.push(`summary length ${summary.length} outside ${MIN_SUMMARY_LEN}-${MAX_SUMMARY_LEN}`);
  }

  if (reasons.length > 0) {
    const reason = reasons.join("; ");
    const attempts = row.hermes_attempts + 1;
    const rejected = attempts >= MAX_HERMES_ATTEMPTS;
    await supabase
      .from("ingest_backlog")
      .update({
        hermes_attempts: attempts,
        status: rejected ? "rejected" : "pending",
        last_error: reason.slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    posthog.capture({
      distinctId: "hermes",
      event: "hermes_result_submitted",
      properties: { kind: "summary_backlog", accepted: false, reason },
    });
    await posthog.shutdown();

    return Response.json(
      { accepted: false, reason, attempts_left: Math.max(0, MAX_HERMES_ATTEMPTS - attempts) },
      { status: 422 }
    );
  }

  const category = rawCategory as CategorySlug;

  // Test rows validate end-to-end but never reach users: the parsed output is
  // stored on the backlog row only, news_items/story_archive are untouched.
  if (row.is_test) {
    await supabase
      .from("ingest_backlog")
      .update({
        status: "done",
        result: { category, summary, entities },
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    posthog.capture({
      distinctId: "hermes",
      event: "hermes_result_submitted",
      properties: { kind: "summary_backlog", accepted: true, reason: "is_test" },
    });
    await posthog.shutdown();

    return Response.json({ accepted: true, news_item_id: null, duplicate: false });
  }

  const outcome = await persistStory(
    supabase,
    {
      title: row.title,
      sourceUrl: row.source_url,
      sourceName: row.source_name,
      imageUrl: row.image_url,
      publishedAt: row.published_at,
    },
    { category, summary, entities }
  );

  if (!outcome.ok) {
    // A real DB error, not a validation problem — don't burn a HERMES attempt
    // or move the row off "pending"; it stays retryable on the next poll.
    posthog.capture({
      distinctId: "hermes",
      event: "hermes_result_submitted",
      properties: { kind: "summary_backlog", accepted: false, reason: `persist error: ${outcome.error}` },
    });
    await posthog.shutdown();
    return Response.json({ error: outcome.error }, { status: 500 });
  }

  await supabase
    .from("ingest_backlog")
    .update({
      status: "done",
      news_item_id: outcome.id,
      result: { category, summary, entities },
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  posthog.capture({
    distinctId: "hermes",
    event: "hermes_result_submitted",
    properties: { kind: "summary_backlog", accepted: true, reason: outcome.duplicate ? "duplicate" : "ok" },
  });
  await posthog.shutdown();

  return Response.json({ accepted: true, news_item_id: outcome.id, duplicate: outcome.duplicate });
}
