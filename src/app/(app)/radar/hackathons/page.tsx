import type { Metadata } from "next";
import { getHackathons } from "@/lib/hackathons";
import { HackathonsClient } from "../HackathonsClient";

// Hackathons — aggregated AI/tech hackathons (Devpost now), shown in-app with a
// direct registration link. ISR every 30 min; degrades to empty pre-migration.
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Hackathons — Kapyn Radar",
  description: "AI & tech hackathons to go build in.",
};

export default async function HackathonsPage() {
  const hackathons = await getHackathons(60);
  return <HackathonsClient hackathons={hackathons} />;
}
