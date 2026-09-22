import { createClient } from "@supabase/supabase-js";
import { isAuthorizedHermes } from "@/lib/hermes-auth";
import { buildClassifyAndSummarizePrompt, VALID_SLUGS } from "@/lib/news-ingest";
import { feedCutoffISO } from "@/lib/feed-window";
import { getPostHogClient } from "@/lib/posthog-server";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

const MAX_HERMES_ATTEMPTS = 3;

const OUTPUT_FORMAT = {
  category: `one of: ${VALID_SLUGS.join(", ")}`,
  summary: "2-4 plain-English sentences (80-900 chars), or LOW_SIGNAL / OFF_TOPIC per the instructions",
  entities: [{ name: "string", type: "model | tool | company | technique | concept" }],
};

function buildInstructions(row: {
  title: string;
  content: string;
  default_category: string;
}): string {
  return `${buildClassifyAndSummarizePrompt(row.title, row.content, row.default_category)}

Do not reply in the CATEGORY:/SUMMARY:/ENTITIES: text format above — that format is for a
different internal caller. Instead, call the kapyn integration's submit_result action with
the parsed fields as JSON: { "category": "<slug>", "summary": "<text or LOW_SIGNAL/OFF_TOPIC>",
"entities": [{"name":"...","type":"..."}] }. See output_format on this task for the exact shape.`;
}

type BacklogRow = {
  id: string;
  source_url: string;
  title: string;
  source_name: string;
  default_category: string;
  content: string;
  published_at: string;
};

// Best-effort maintenance pass, run on every poll before task selection:
//   - a pending row whose story fell out of the feed window is expired
//   - a pending row Vercel already summarised on a later run (source_url now
//     lives in news_items) is superseded, so HERMES doesn't duplicate work
// Polling itself never creates rows — only api/news/fetch does that.
async function sweepBacklog(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<void> {
  const cutoff = feedCutoffISO();

  await supabase
    .from("ingest_backlog")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("status", "pending")
    .lt("published_at", cutoff);

  const { data: pending } = await supabase
    .from("ingest_backlog")
    .select("source_url")
    .eq("status", "pending");
  const pendingUrls = (pending ?? []).map((r: { source_url: string }) => r.source_url);
  if (pendingUrls.length === 0) return;

  const { data: handled } = await supabase
    .from("news_items")
    .select("source_url")
    .in("source_url", pendingUrls);
  const handledUrls = (handled ?? []).map((r: { source_url: string }) => r.source_url);
  if (handledUrls.length === 0) return;

  await supabase
    .from("ingest_backlog")
    .update({ status: "superseded", updated_at: new Date().toISOString() })
    .eq("status", "pending")
    .in("source_url", handledUrls);
}

export async function GET(request: Request) {
  if (!isAuthorizedHermes(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const limitParam = parseInt(url.searchParams.get("limit") ?? "1", 10);
  const limit = Math.min(5, Math.max(1, Number.isFinite(limitParam) ? limitParam : 1));

  const supabase = getSupabaseAdmin();
  const posthog = getPostHogClient();

  // Only one task kind exists in this slice. An unrecognised (or future,
  // not-yet-implemented) kind returns an empty list rather than an error, so
  // HERMES's polling loop never has to special-case "not supported yet".
  if (kind !== "summary_backlog") {
    posthog.capture({
      distinctId: "hermes",
      event: "hermes_tasks_polled",
      properties: { kind, count: 0 },
    });
    await posthog.shutdown();
    return Response.json({ tasks: [] });
  }

  await sweepBacklog(supabase);

  const cutoff = feedCutoffISO();
  const { data: rows, error } = await supabase
    .from("ingest_backlog")
    .select("id, source_url, title, source_name, default_category, content, published_at")
    .eq("status", "pending")
    .lt("hermes_attempts", MAX_HERMES_ATTEMPTS)
    .gte("published_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const tasks = (rows as BacklogRow[] ?? []).map((row) => ({
    id: row.id,
    kind: "summary_backlog" as const,
    input: {
      title: row.title,
      content: row.content,
      source_name: row.source_name,
      default_category: row.default_category,
      published_at: row.published_at,
    },
    instructions: buildInstructions(row),
    output_format: OUTPUT_FORMAT,
  }));

  posthog.capture({
    distinctId: "hermes",
    event: "hermes_tasks_polled",
    properties: { kind, count: tasks.length },
  });
  await posthog.shutdown();

  return Response.json({ tasks });
}
