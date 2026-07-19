// TEMPORARY debug endpoint — confirms composeAllFeed's opener now leads by heat.
// Returns the real fetchNewsItems() order annotated with heat/sources/age.
// DELETE after verification.

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
      heat: +(s?.heat ?? 0).toFixed(2),
      source: it.sourceName,
      title: it.title.slice(0, 60),
    };
  });
  return Response.json({ count: feed.length, rows });
}
