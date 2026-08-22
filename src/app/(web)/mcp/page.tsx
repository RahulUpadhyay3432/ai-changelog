import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MCP_SERVERS, MCP_CATEGORY_ORDER, MCP_CATEGORY_EMOJI, type McpCategory } from "@/lib/radar-mcp";
import { slugify } from "@/lib/entities";
import { GOLD, GOLD_SOFT, GOLD_BORDER, HAIRLINE, SG } from "@/lib/design-tokens";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

// The 40-word extractable answer — the format answer engines quote verbatim.
const WHAT_IS_MCP =
  "The Model Context Protocol (MCP) is an open standard that lets AI assistants connect to outside tools and data, files, databases, APIs, browsers and apps , through one common interface, so a model can take actions, not just chat.";

const DESC =
  "A curated directory of the most useful MCP (Model Context Protocol) servers, grouped by category, connect your AI assistant to GitHub, databases, search, browsers, payments and more.";

export const metadata: Metadata = {
  title: "Best MCP servers, the Model Context Protocol directory",
  description: DESC,
  alternates: { canonical: `${APP_URL}/mcp` },
  openGraph: { title: "Best MCP servers, Kapyn", description: DESC, url: `${APP_URL}/mcp`, siteName: "Kapyn", type: "website" },
  twitter: { card: "summary_large_image", title: "Best MCP servers, Kapyn", description: DESC },
};

export default function McpHub() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best MCP servers",
    description: DESC,
    itemListElement: MCP_SERVERS.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${s.name} MCP server`,
      url: `${APP_URL}/mcp/${slugify(s.name)}`,
      description: s.tagline,
    })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is the Model Context Protocol (MCP)?", acceptedAnswer: { "@type": "Answer", text: WHAT_IS_MCP } },
      { "@type": "Question", name: "What are the best MCP servers?", acceptedAnswer: { "@type": "Answer", text: `Widely used MCP servers include ${MCP_SERVERS.slice(0, 8).map((s) => s.name).join(", ")}, covering dev tools, databases, search, browser automation, productivity, cloud, and payments.` } },
    ],
  };

  const sectionKicker = { fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: GOLD, margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <header style={{ margin: "4px 0 26px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>MCP directory</span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, margin: "12px 0 0", color: "#f5f5f5" }}>
          Best MCP servers
        </h1>
        <p style={{ fontSize: "16px", color: "var(--kt-text-muted, #a3a3a3)", lineHeight: 1.55, margin: "14px 0 0", maxWidth: "600px" }}>{DESC}</p>
      </header>

      <section style={{ margin: "0 0 30px", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
        <h2 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: "#f5f5f5", margin: 0 }}>What is the Model Context Protocol?</h2>
        <p style={{ fontSize: "15.5px", color: "#cbc7bf", lineHeight: 1.65, margin: "10px 0 0" }}>{WHAT_IS_MCP}</p>
      </section>

      {MCP_CATEGORY_ORDER.map((c: McpCategory) => {
        const servers = MCP_SERVERS.filter((s) => s.category === c);
        if (servers.length === 0) return null;
        return (
          <section key={c} style={{ marginBottom: "30px" }}>
            <h2 style={sectionKicker}>
              <span aria-hidden style={{ fontSize: "15px" }}>{MCP_CATEGORY_EMOJI[c]}</span>{c}
              <span style={{ color: "#525252", fontWeight: 600 }}>{servers.length}</span>
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {servers.map((s) => (
                <li key={s.name}>
                  <Link href={`/mcp/${slugify(s.name)}`} style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "14px 16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: SG, fontSize: "15.5px", fontWeight: 600, color: "#f5f5f5" }}>{s.name}</span>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: s.by === "official" ? GOLD : "var(--kt-text-muted, #a3a3a3)", background: s.by === "official" ? GOLD_SOFT : "rgba(255,255,255,0.05)", border: `1px solid ${s.by === "official" ? GOLD_BORDER : HAIRLINE}`, borderRadius: "100px", padding: "2px 8px" }}>{s.by}</span>
                    </span>
                    <span style={{ display: "block", fontSize: "13.5px", color: "var(--kt-text-muted, #a3a3a3)", lineHeight: 1.45, marginTop: "4px" }}>{s.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div style={{ margin: "10px 0 0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <h2 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: "#f5f5f5", margin: 0 }}>Browse them interactively</h2>
          <p style={{ fontSize: "14px", color: "var(--kt-text-muted, #a3a3a3)", margin: "6px 0 0", lineHeight: 1.5 }}>Sort by popularity and recency, filter by category, and save servers into a Loadout on the Radar.</p>
        </div>
        <Link href="/radar/mcp" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "12px 20px", textDecoration: "none" }}>
          Open the MCP market <ArrowUpRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </>
  );
}
