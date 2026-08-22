import type { Metadata } from "next";
import { getRadarTools, getRadarCards, getRadarMcpDiscovered } from "@/lib/knowledge";
import { getTrending } from "@/lib/trending";
import { PulseClient } from "./PulseClient";

const APP_URL = "https://kapyn.app";

// The weekly Pulse — momentum, not inventory. Server-fetches the radar data, then
// hands off to PulseClient for the rich, ranked, Radar-styled layout. ISR 30m.
export const revalidate = 1800;

const DESC =
  "What's gaining momentum in AI right now, the tools, MCP servers, and stories trending this week. Ranked by movement, refreshed daily.";

export const metadata: Metadata = {
  title: "This Week in AI, trending tools, MCP servers & stories",
  description: DESC,
  alternates: { canonical: `${APP_URL}/radar/pulse` },
  openGraph: {
    title: "This Week in AI, Kapyn Pulse",
    description: DESC,
    url: `${APP_URL}/radar/pulse`,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "This Week in AI, Kapyn Pulse", description: DESC },
};

// Monday of the current week, "Week of Jul 2".
function weekOfLabel(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default async function PulsePage() {
  const [tools, mcp, entities, trending] = await Promise.all([
    getRadarTools(24),
    getRadarMcpDiscovered(8),
    getRadarCards(7, 2, 14),
    getTrending(24 * 7, 5, 0).catch(() => ({ top: [], rest: [] })),
  ]);
  const stories = trending.top;

  const launches = tools.filter((t) => t.source === "producthunt").length;
  const stats = [
    { n: tools.length, label: "rising" },
    { n: launches, label: "launches" },
    { n: mcp.length, label: "new MCP" },
    { n: entities.length, label: "in the news" },
  ].filter((s) => s.n > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending AI tools this week",
    description: DESC,
    url: `${APP_URL}/radar/pulse`,
    itemListElement: tools.slice(0, 20).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: t.url,
      description: t.valueLine,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PulseClient tools={tools} mcp={mcp} entities={entities} stories={stories} stats={stats} weekOf={weekOfLabel()} />
    </>
  );
}
