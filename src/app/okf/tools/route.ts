import {
  getRadarCards,
  getRadarTools,
  getRadarEssentials,
  type RadarItem,
  type RadarTool,
} from "@/lib/knowledge";

export const revalidate = 3600;

const APP_URL = "https://kapyn.app";

function renderTool(t: RadarTool): string {
  let out = `### ${t.name}\n\n`;
  out += `* **source:** ${t.source}\n`;
  if (t.topics.length > 0) out += `* **topics:** ${t.topics.join(", ")}\n`;
  if (t.meta) out += `* **meta:** ${t.meta}\n`;
  out += `* **url:** ${t.url}\n\n`;
  out += `${t.valueLine}\n\n---\n\n`;
  return out;
}

function renderEntity(item: RadarItem): string {
  const e = item.entity;
  let out = `### ${e.canonicalName}\n\n`;
  out += `* **type:** ${e.entityType}\n`;
  out += `* **mentions:** ${e.mentionCount}\n`;
  if (e.shortDesc) out += `* **description:** ${e.shortDesc}\n`;
  if (item.latestStory) {
    out += `* **latest-story:** [${item.latestStory.title}](${APP_URL}/story/${item.latestStory.id})\n`;
  }
  out += "\n";
  if (item.valueLine) out += `${item.valueLine}\n\n`;
  out += "---\n\n";
  return out;
}

export async function GET() {
  const [tools, entities, essentials] = await Promise.all([
    getRadarTools(30),
    getRadarCards(21, 2, 30),
    getRadarEssentials(40),
  ]);

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const trendingSection =
    tools.length > 0
      ? tools.map(renderTool).join("")
      : "_No trending tools at the moment._\n\n";

  const entitiesSection =
    entities.length > 0
      ? entities.map(renderEntity).join("")
      : "_No entities at the moment._\n\n";

  const essentialsSection =
    essentials.length > 0
      ? essentials.map(renderTool).join("")
      : "_No essentials listed yet._\n\n";

  const allTopics = [
    ...new Set([
      ...tools.flatMap((t) => t.topics),
      ...essentials.flatMap((t) => t.topics),
    ]),
  ].slice(0, 20);

  const total = tools.length + entities.length + essentials.length;

  const md = `---
type: AI Tools Catalog
title: Kapyn Radar — AI Tools & Entities (${today})
description: ${total} active AI tools, models, and entities tracked by Kapyn Radar
resource: ${APP_URL}/radar
tags: [${allTopics.join(", ")}]
timestamp: ${now}
---

# Kapyn Radar — AI Tools Catalog (${today})

Tracking ${total} items: ${tools.length} trending tools · ${entities.length} AI entities · ${essentials.length} essentials

[← Back to catalog](/okf)

## Trending Tools

New and trending tools from GitHub and Product Hunt, updated daily.

${trendingSection}
## AI Entities

Active AI models, tools, and companies tracked by the Kapyn knowledge graph.

${entitiesSection}
## Essential Tools

Evergreen AI tools and platforms every builder should know.

${essentialsSection}`;

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
