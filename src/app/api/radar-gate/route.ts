import { type NextRequest, NextResponse } from "next/server";
import { getRadarFeed, getRadarTools } from "@/lib/knowledge";

export const maxDuration = 15;

// Debug endpoint — dumps the radar entity feed as JSON so we can eyeball data
// quality before building any UI. No auth required (anon-readable data only).
//
// Hit: GET /api/radar-gate
// Query params: days=14&min=2&limit=40 (all optional)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") ?? "14", 10);
  const min = parseInt(url.searchParams.get("min") ?? "2", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "40", 10);

  const [items, tools] = await Promise.all([
    getRadarFeed(isNaN(days) ? 14 : days, isNaN(min) ? 2 : min, isNaN(limit) ? 40 : limit),
    getRadarTools(30),
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
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
