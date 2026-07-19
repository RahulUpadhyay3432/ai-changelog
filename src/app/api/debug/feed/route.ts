// TEMPORARY debug endpoint — verifies the composeAllFeed opener/body split on
// real data. Returns the ACTUAL fetchNewsItems() order annotated with each
// card's heat/sources/age so we can confirm the opener is heat-ranked and the
// body is recency-ordered. DELETE this file after verification.

import { fetchNewsItems, supabase } from "@/lib/supabase";
import { scoreStoriesByCoverage } from "@/lib/coverage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await fetchNewsItems(); // real "all" order → composeAllFeed
  const scores = await scoreStoriesByCoverage(
    supabase,
    feed.map((it) => ({ id: it.id, source_url: it.sourceUrl, published_at: it.publishedAt })),
    { recencyTauHours: 24 }
  );
  const now = Date.now();
  const rows = feed.slice(0, 15).map((it, i) => {
    const s = scores.get(it.id);
    return {
      pos: i + 1,
      ageH: +((now - new Date(it.publishedAt).getTime()) / 3.6e6).toFixed(1),
      sources: s?.sources ?? 0,
      heat: +(s?.heat ?? 0).toFixed(3),
      source: it.sourceName,
      title: it.title.slice(0, 64),
    };
  });
  return Response.json({ count: feed.length, rows });
}
