import { type NextRequest, NextResponse } from "next/server";
import { getRadarFeed } from "@/lib/knowledge";
import { callLLM } from "@/lib/llm";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const maxDuration = 60;

// PROTOTYPE endpoint (remove after the value-line go/no-go). Generates the
// actionable "what this lets you do" line for the top radar entities so we can
// eyeball quality before committing to Option 2 (generate once, cache forever).
// Hard-capped + rate-limited so a manual hit costs ~10 free-tier calls, no more.
const MAX_ENTITIES = 12;

function valueLinePrompt(name: string, type: string, title: string, summary: string): string {
  return `You write the single "why a builder should care" line shown on a radar of what's new in AI. Reframe news into what a developer can DO.

Entity: ${name} (${type})
Recent context:
"${title}"
${summary}

Write ONE line, max 14 words, telling a developer what ${name} lets them DO or why it matters for their work — the action/value, not the announcement.
Rules:
- Verb-first where natural. Concrete and specific.
- No hype, no exclamation marks, no marketing adjectives.
- Do not restate the headline; extract the value.
- Reply with exactly INSUFFICIENT if the context is too thin, OR if it is merely news ABOUT the entity (funding, partnerships, spending, hiring, valuation) rather than a capability, tool, or release a developer can actually use.

Good examples:
- Serves 70B models on one consumer GPU — cuts inference cost
- Edits across files in agent mode — faster refactors
- Open-source coding model you can self-host

Value line:`;
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { ok } = await rateLimit({ key: `radar-vl:${ip}`, limit: 5, windowSeconds: 300 });
  if (!ok) {
    return NextResponse.json({ error: "Rate limited — try again in a few minutes." }, { status: 429 });
  }

  const url = new URL(req.url);
  const reqLimit = parseInt(url.searchParams.get("limit") ?? "10", 10);
  const limit = Math.min(isNaN(reqLimit) ? 10 : reqLimit, MAX_ENTITIES);

  // Only entities that have a source story can get a value line.
  const feed = (await getRadarFeed(21, 2, 40)).filter((it) => it.latestStory).slice(0, limit);

  // Sequential, not Promise.all — concurrent bursts trip the free-tier rate
  // limit, and production generates one-at-a-time during ingestion anyway.
  const items: Array<Record<string, unknown>> = [];
  for (const it of feed) {
    const story = it.latestStory!;
    const base = {
      name: it.entity.canonicalName,
      type: it.entity.entityType,
      source: { title: story.title, summary: story.summary },
    };
    try {
      const { text, model } = await callLLM(
        valueLinePrompt(it.entity.canonicalName, it.entity.entityType, story.title, story.summary),
        80
      );
      const line = text.replace(/^value line:\s*/i, "").replace(/^[-*"]\s*/, "").trim();
      const held = /^insufficient$/i.test(line) || line.length === 0;
      items.push({ ...base, valueLine: held ? null : line, held, model });
    } catch (err) {
      items.push({ ...base, valueLine: null, held: true, model: "error", error: String(err).slice(0, 120) });
    }
  }

  const shipped = items.filter((it) => !it.held).length;
  return NextResponse.json(
    { count: items.length, shipped, held: items.length - shipped, items },
    { headers: { "Cache-Control": "no-store" } }
  );
}
