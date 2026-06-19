import { getRadarTools, getRadarCards, getRadarEssentials } from "@/lib/knowledge";
import { BrowseClient } from "../BrowseClient";

// Browse — the explore-by-category surface over the whole radar catalog
// (trending tools, knowledge-graph entities, essentials). ISR every 30 min.
export const revalidate = 1800;

export default async function BrowsePage() {
  const [tools, entities, essentials] = await Promise.all([
    getRadarTools(30),
    getRadarCards(21, 2, 40),
    getRadarEssentials(60),
  ]);

  return <BrowseClient tools={tools} entities={entities} essentials={essentials} />;
}
