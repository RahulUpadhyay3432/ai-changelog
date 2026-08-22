import type { Metadata } from "next";
import { PacksClient } from "../PacksClient";

export const metadata: Metadata = {
  title: "Starter packs, the AI stack to actually use",
  description:
    "Hand-picked AI tool stacks for a real job, ship an agent, vibe-code a SaaS, RAG in a weekend, run open models. Save one as a Loadout in a tap.",
};

export default function PacksPage() {
  return <PacksClient />;
}
