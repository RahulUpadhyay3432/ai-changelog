import { getTrending } from "@/lib/trending";
import { TrendingClient } from "./TrendingClient";

// Trending is the signal layer over the firehose: the day's Top 3 (deduped to
// distinct topics) + the rest ranked by source coverage × recency. Server-ranked,
// ISR every 30 min so it stays fresh without re-ranking on every view.
export const revalidate = 1800;

export default async function TrendingPage() {
  const { top, rest } = await getTrending();
  return <TrendingClient top={top} rest={rest} />;
}
