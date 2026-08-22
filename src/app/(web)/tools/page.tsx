import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CURATED_ESSENTIALS } from "@/lib/radar-essentials";
import { GOLD, HAIRLINE, SG } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

// The 40-word extractable answer for "what are AI tools".
const WHAT_ARE_TOOLS =
  "AI tools are the apps and services that put AI to work, chat assistants, coding copilots, image and video generators, agent frameworks, and the infrastructure to run them , so you can build, create and ship without starting from scratch.";

const DESC =
  "A curated directory of the essential AI tools worth knowing, models and chat, coding, UI and design, agents, inference, data and more , the must-know names, by category.";

const CATEGORY_EMOJI: Record<string, string> = {
  "Models & chat": "🧠",
  "AI coding": "⌨️",
  "UI & design": "🎨",
  "Inference": "⚡",
  "Data & RAG": "🗂️",
  "Agents & automation": "🤖",
  "Orchestration": "🔗",
  "Security": "🛡️",
  "Eval & observability": "📈",
  "Video": "🎬",
  "Voice & audio": "🎙️",
  "Image": "🖼️",
  "Marketing & content": "📣",
};

export const metadata: Metadata = {
  title: "Best AI tools, the essential AI tools worth knowing, by category",
  description: DESC,
  alternates: { canonical: `${APP_URL}/tools` },
  openGraph: { title: "Best AI tools, Kapyn", description: DESC, url: `${APP_URL}/tools`, siteName: "Kapyn", type: "website" },
  twitter: { card: "summary_large_image", title: "Best AI tools, Kapyn", description: DESC },
};

export default function ToolsHub() {
  // Category order = first appearance in the curated list (accessible-first).
  const order: string[] = [];
  for (const t of CURATED_ESSENTIALS) if (!order.includes(t.category)) order.push(t.category);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best AI tools",
    description: DESC,
    itemListElement: CURATED_ESSENTIALS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: t.url,
      description: t.valueLine,
    })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What are AI tools?", acceptedAnswer: { "@type": "Answer", text: WHAT_ARE_TOOLS } },
      { "@type": "Question", name: "What AI tools should you start with?", acceptedAnswer: { "@type": "Answer", text: "Most people start with a chat assistant (ChatGPT, Claude or Gemini) and a coding tool (Cursor or GitHub Copilot), then add image, video, agent and data tools as needed. This directory groups the essentials by category." } },
    ],
  };

  const kicker = { fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: GOLD, margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faq) }} />

      <header style={{ margin: "4px 0 26px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>AI tools directory</span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, margin: "12px 0 0", color: "#f5f5f5" }}>
          Best AI tools
        </h1>
        <p style={{ fontSize: "16px", color: "var(--kt-text-muted, #a3a3a3)", lineHeight: 1.55, margin: "14px 0 0", maxWidth: "600px" }}>{DESC}</p>
      </header>

      <section style={{ margin: "0 0 30px", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
        <h2 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: "#f5f5f5", margin: 0 }}>What are AI tools?</h2>
        <p style={{ fontSize: "15.5px", color: "#cbc7bf", lineHeight: 1.65, margin: "10px 0 0" }}>{WHAT_ARE_TOOLS}</p>
      </section>

      {order.map((cat) => {
        const tools = CURATED_ESSENTIALS.filter((t) => t.category === cat);
        if (tools.length === 0) return null;
        return (
          <section key={cat} style={{ marginBottom: "30px" }}>
            <h2 style={kicker}>
              {CATEGORY_EMOJI[cat] && <span aria-hidden style={{ fontSize: "15px" }}>{CATEGORY_EMOJI[cat]}</span>}{cat}
              <span style={{ color: "#525252", fontWeight: 600 }}>{tools.length}</span>
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {tools.map((t) => (
                <li key={t.url}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "14px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "15.5px", fontWeight: 600, color: "#f5f5f5" }}>
                      {t.name}
                      <ArrowUpRight size={13} strokeWidth={2.2} color="#737373" style={{ flexShrink: 0 }} />
                    </span>
                    <span style={{ display: "block", fontSize: "13.5px", color: "var(--kt-text-muted, #a3a3a3)", lineHeight: 1.45, marginTop: "4px" }}>{t.valueLine}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div style={{ margin: "10px 0 0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <h2 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: "#f5f5f5", margin: 0 }}>Browse them interactively</h2>
          <p style={{ fontSize: "14px", color: "var(--kt-text-muted, #a3a3a3)", margin: "6px 0 0", lineHeight: 1.5 }}>See what is trending, filter by what you build, and save tools into a Loadout on the Radar.</p>
        </div>
        <Link href="/radar/browse" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "12px 20px", textDecoration: "none" }}>
          Open the Radar <ArrowUpRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </>
  );
}
