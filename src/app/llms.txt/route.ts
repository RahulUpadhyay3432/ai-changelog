import { getLearnEntities } from "@/lib/knowledge";

// /llms.txt — the emerging standard that hands LLMs/AI crawlers a curated, plain
// map of the site's high-value content. Generated from the published concept
// explainers so it stays current as the knowledge base grows.
export const revalidate = 3600;

const APP_URL = "https://kapyn.app";

function oneLine(s: string | null): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const entities = await getLearnEntities(200);

  const lines: string[] = [
    "# Kapyn",
    "",
    "> Kapyn is the calm intelligence layer for AI — AI/tech news distilled to 30-second dispatches, plus an auto-generated, source-grounded knowledge base that explains the concepts behind the news. Every explainer is generated from Kapyn's own news stream and cites its sources.",
    "",
    "## AI concepts & techniques",
  ];

  for (const e of entities) {
    const desc = oneLine(e.shortDesc);
    lines.push(`- [${e.canonicalName}](${APP_URL}/learn/${e.slug})${desc ? `: ${desc}` : ""}`);
  }

  lines.push(
    "",
    "## Key pages",
    `- [Explore — the AI glossary](${APP_URL}/explore): index of every concept explainer`,
    `- [Kapyn](${APP_URL}): the swipeable AI/tech news feed`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
