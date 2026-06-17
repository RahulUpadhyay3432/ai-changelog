import { getRadarTools, getRadarCards, getRadarEssentials } from "@/lib/knowledge";
import { RadarClient } from "./RadarClient";

// Server-fetches the cached radar engine, then hands off to the client for
// lens-aware (Builder / Founder / Curious) arrangement. ISR every 30 min.
export const revalidate = 1800;

export default async function RadarPage() {
  const [tools, entities, essentials] = await Promise.all([
    getRadarTools(12),
    getRadarCards(21, 2, 16),
    getRadarEssentials(40),
  ]);

  return <RadarClient tools={tools} entities={entities} essentials={essentials} />;
}
