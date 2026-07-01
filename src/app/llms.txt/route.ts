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
    "## Knowledge catalog (Open Knowledge Format)",
    "",
    "Structured, agent-readable bundles in text/markdown with YAML frontmatter (OKF v0.1). Updated hourly.",
    "",
    `- [Catalog index](${APP_URL}/okf): bundle index — story counts, tool inventory, category breakdown`,
    `- [Today's stories](${APP_URL}/okf/stories): full 48h news digest grouped by category`,
    `- [AI tools radar](${APP_URL}/okf/tools): active AI tools, models, and entities tracked by Kapyn`,
    "",
    "## Key pages",
    `- [Explore — the AI glossary](${APP_URL}/explore): index of every concept explainer`,
    `- [Radar](${APP_URL}/radar): curated AI agents, models, tools, MCP servers & skills`,
    `- [MCP servers](${APP_URL}/mcp): directory of Model Context Protocol servers, by category`,
    `- [AI tools](${APP_URL}/tools): the essential AI tools worth knowing, by category`,
    `- [AI skills](${APP_URL}/skills): custom GPTs, Claude Skills & Gemini Gems, by use case`,
    `- [Compare AI models](${APP_URL}/compare): Claude, GPT, Gemini, Llama and more side by side — context, cost, modalities, best-for`,
    `- [Blog](${APP_URL}/blog): guides on the AI and tools worth using`,
    `- [Kapyn](${APP_URL}): the swipeable AI/tech news feed`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
