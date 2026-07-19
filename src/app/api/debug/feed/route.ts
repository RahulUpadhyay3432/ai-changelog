// TEMPORARY debug endpoint — diagnoses why composeAllFeed's opener is empty.
// Hypothesis: scoring 100 items at once overflows the .in("source_url", …) URL
// limit → null → empty scores. Counts sources>0 at increasing batch sizes.
// DELETE after verification.

import { supabase } from "@/lib/supabase";
import { scoreStoriesByCoverage } from "@/lib/coverage";
import { feedCutoffISO } from "@/lib/feed-window";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = { id: string; source_url: string; published_at: string };

async function countSourced(rows: Row[]): Promise<number> {
  const scores = await scoreStoriesByCoverage(supabase, rows, { recencyTauHours: 24 });
  let n = 0;
  for (const v of scores.values()) if (v.sources > 0) n++;
  return n;
}

export async function GET() {
  const { data } = await supabase
    .from("news_items")
    .select("id, source_url, published_at")
    .gte("published_at", feedCutoffISO())
    .order("published_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []).map((r) => ({
    id: r.id as string,
    source_url: r.source_url as string,
    published_at: r.published_at as string,
  }));

  return Response.json({
    total: rows.length,
    sourced_first25: await countSourced(rows.slice(0, 25)),
    sourced_first50: await countSourced(rows.slice(0, 50)),
    sourced_first75: await countSourced(rows.slice(0, 75)),
    sourced_all: await countSourced(rows),
  });
}
