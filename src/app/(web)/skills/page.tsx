import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AI_SKILLS, SKILL_CATEGORY_ORDER, SKILL_CATEGORY_EMOJI, type SkillCategory } from "@/lib/radar-skills";
import { slugify } from "@/lib/entities";
import { GOLD, GOLD_SOFT, GOLD_BORDER, HAIRLINE, SG } from "@/lib/design-tokens";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

const WHAT_ARE_SKILLS =
  "AI skills are prebuilt capabilities you add to an assistant, custom GPTs, Claude Skills and Gemini Gems , that specialise it for one job, like writing, coding, research or design, so you get expert results without crafting the prompt yourself.";

const DESC =
  "A curated directory of the best AI skills, custom GPTs, Claude Skills and Gemini Gems , by use case: writing, coding, research, design, data, productivity and more.";

export const metadata: Metadata = {
  title: "Best AI skills, custom GPTs, Claude Skills & Gemini Gems",
  description: DESC,
  alternates: { canonical: `${APP_URL}/skills` },
  openGraph: { title: "Best AI skills, Kapyn", description: DESC, url: `${APP_URL}/skills`, siteName: "Kapyn", type: "website" },
  twitter: { card: "summary_large_image", title: "Best AI skills, Kapyn", description: DESC },
};

export default function SkillsHub() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best AI skills",
    description: DESC,
    itemListElement: AI_SKILLS.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${APP_URL}/skills/${slugify(s.name)}`,
      description: s.tagline,
    })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What are AI skills?", acceptedAnswer: { "@type": "Answer", text: WHAT_ARE_SKILLS } },
      { "@type": "Question", name: "What is the difference between a custom GPT, a Claude Skill and a Gemini Gem?", acceptedAnswer: { "@type": "Answer", text: "They are the same idea on different assistants: a custom GPT runs in ChatGPT, a Claude Skill in Claude, and a Gemini Gem in Gemini. Each packages instructions (and sometimes tools) so the assistant specialises in one task." } },
    ],
  };

  const kicker = { fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: GOLD, margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <header style={{ margin: "4px 0 26px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>AI skills directory</span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, margin: "12px 0 0", color: "#f5f5f5" }}>
          Best AI skills
        </h1>
        <p style={{ fontSize: "16px", color: "var(--kt-text-muted, #a3a3a3)", lineHeight: 1.55, margin: "14px 0 0", maxWidth: "600px" }}>{DESC}</p>
      </header>

      <section style={{ margin: "0 0 30px", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
        <h2 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: "#f5f5f5", margin: 0 }}>What are AI skills?</h2>
        <p style={{ fontSize: "15.5px", color: "#cbc7bf", lineHeight: 1.65, margin: "10px 0 0" }}>{WHAT_ARE_SKILLS}</p>
      </section>

      {SKILL_CATEGORY_ORDER.map((c: SkillCategory) => {
        const skills = AI_SKILLS.filter((s) => s.category === c);
        if (skills.length === 0) return null;
        return (
          <section key={c} style={{ marginBottom: "30px" }}>
            <h2 style={kicker}>
              <span aria-hidden style={{ fontSize: "15px" }}>{SKILL_CATEGORY_EMOJI[c]}</span>{c}
              <span style={{ color: "#525252", fontWeight: 600 }}>{skills.length}</span>
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {skills.map((s) => (
                <li key={s.name}>
                  <Link href={`/skills/${slugify(s.name)}`} style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "14px 16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: SG, fontSize: "15.5px", fontWeight: 600, color: "#f5f5f5" }}>{s.name}</span>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "2px 8px" }}>{s.platform}</span>
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
          <p style={{ fontSize: "14px", color: "var(--kt-text-muted, #a3a3a3)", margin: "6px 0 0", lineHeight: 1.5 }}>Filter by use case and platform, and save the skills you like into a Loadout on the Radar.</p>
        </div>
        <Link href="/radar/mcp?tab=skills" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "12px 20px", textDecoration: "none" }}>
          Open the skills market <ArrowUpRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </>
  );
}
