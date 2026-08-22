import type { Metadata } from "next";
import { CompareClient } from "@/components/compare/CompareClient";

export const revalidate = 86400;

// Noindex the embed so the canonical /compare page keeps all the ranking signal;
// the widget's job is to live on other sites and link back.
export const metadata: Metadata = {
  title: "AI Model Comparison, Kapyn",
  robots: { index: false, follow: true },
};

export default function EmbedComparePage() {
  return <CompareClient embed />;
}
