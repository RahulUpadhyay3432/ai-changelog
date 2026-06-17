import { type NextRequest, NextResponse } from "next/server";
import { getRadarFeed, getRadarTools, getRadarEssentials } from "@/lib/knowledge";
import { isAuthorizedCron } from "@/lib/cron-auth";

export const maxDuration = 15;

// Debug endpoint — dumps the radar feed as JSON for data-quality checks. Gated
// behind CRON_SECRET (it can run large Supabase scans and expose the full
// corpus), and the params are clamped to sane maxima.
//
// Hit: GET /api/radar-gate?secret=...   Query: days=14&min=2&limit=40 (optional)
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "14", 10) || 14, 1), 60);
  const min = Math.max(parseInt(url.searchParams.get("min") ?? "2", 10) || 2, 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "40", 10) || 40, 1), 100);

  const [items, tools, essentials] = await Promise.all([
    getRadarFeed(days, min, limit),
    getRadarTools(30),
    getRadarEssentials(40),
  ]);

  const formatted = items.map((item, i) => ({
    rank: i + 1,
    name: item.entity.canonicalName,
    type: item.entity.entityType,
    mentions: item.entity.mentionCount,
    lastSeen: item.entity.lastMentionedAt,
    isNew: item.isNew,
    valueLine: item.valueLine,
    grounded: !!item.valueLine,
    latestStory: item.latestStory
      ? {
          title: item.latestStory.title,
          summary: item.latestStory.summary,
          source: item.latestStory.sourceName,
          publishedAt: item.latestStory.publishedAt,
        }
      : null,
  }));

  return NextResponse.json(
    {
      count: formatted.length,
      params: { days, min, limit },
      items: formatted,
      toolsCount: tools.length,
      tools: tools.map((t) => ({
        source: t.source,
        name: t.name,
        valueLine: t.valueLine,
        meta: t.meta,
        url: t.url,
      })),
      essentialsCount: essentials.length,
      essentials: essentials.map((t) => ({
        source: t.source,
        name: t.name,
        valueLine: t.valueLine,
        meta: t.meta,
        url: t.url,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
