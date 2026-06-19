import type { Metadata } from "next";
import { McpMarketClient } from "../McpMarketClient";

// MCP market — a curated directory of Model Context Protocol servers, grouped by
// category. Static editorial (src/lib/radar-mcp.ts), so no data fetch needed.
export const metadata: Metadata = {
  title: "MCP market — Kapyn Radar",
  description: "The most useful Model Context Protocol servers, by category.",
};

export default function McpMarketPage() {
  return <McpMarketClient />;
}
