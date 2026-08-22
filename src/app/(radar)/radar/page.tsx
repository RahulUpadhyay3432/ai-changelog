import type { Metadata } from "next";
import { getRadarTools, getRadarCards, getRadarEssentials } from "@/lib/knowledge";
import { getHackathons } from "@/lib/hackathons";
import { RadarClient } from "./RadarClient";

// Server-fetches the cached radar engine, then hands off to the client for
// lens-aware (Builder / Exploring) arrangement. ISR every 30 min. RadarClient
// server-renders a crawlable static index until it hydrates (RadarStaticIndex).
export const revalidate = 1800;

const APP_URL = "https://kapyn.app";
const DESC =
  "A curated radar of the AI worth using, agents, models, tools, MCP servers and skills, kept current by a daily signal. No paywall, ever.";

export const metadata: Metadata = {
  title: "Radar, discover the AI worth using: agents, models, tools, MCP & skills",
  description: DESC,
  alternates: { canonical: `${APP_URL}/radar` },
  openGraph: {
    title: "Kapyn Radar, the AI worth using",
    description: DESC,
    url: `${APP_URL}/radar`,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Kapyn Radar, the AI worth using", description: DESC },
};

export default async function RadarPage() {
  const [tools, entities, essentials, hackathons] = await Promise.all([
    getRadarTools(30),
    getRadarCards(21, 2, 16),
    getRadarEssentials(40),
    getHackathons(8),
  ]);

  // ItemList structured data over the catalog — the AEO unlock for "best AI
  // tools / agents / MCP servers" queries. Deduped by URL.
  const catalog = [...tools, ...essentials].filter((t, i, a) => a.findIndex((x) => x.url === t.url) === i).slice(0, 40);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI agents, models, tools and MCP servers on Kapyn Radar",
    itemListElement: catalog.map((t, i) => ({
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
      <RadarClient tools={tools} entities={entities} essentials={essentials} hackathons={hackathons} />
    </>
  );
}
