import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AI_SKILLS, SKILL_CATEGORY_EMOJI, type AiSkill, type SkillPlatform } from "@/lib/radar-skills";
import { slugify } from "@/lib/entities";
import { GOLD, HAIRLINE, SG } from "@/lib/design-tokens";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

const PLATFORM_LABEL: Record<SkillPlatform, string> = {
  Claude: "Claude Skill",
  GPT: "Custom GPT (ChatGPT)",
  Gemini: "Gemini Gem",
  Multi: "Multi-platform",
};

export function generateStaticParams() {
  const seen = new Set<string>();
  const out: { slug: string }[] = [];
  for (const s of AI_SKILLS) {
    const slug = slugify(s.name);
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug });
  }
  return out;
}

function getSkill(slug: string): AiSkill | undefined {
  return AI_SKILLS.find((s) => slugify(s.name) === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSkill(slug);
  if (!s) return { title: "AI skill not found", robots: { index: false, follow: true } };
  const url = `${APP_URL}/skills/${slug}`;
  const title = `${s.name}, AI skill for ${s.category}`;
  return {
    title,
    description: s.tagline,
    alternates: { canonical: url },
    openGraph: { title, description: s.description, url, siteName: "Kapyn", type: "article" },
    twitter: { card: "summary", title, description: s.tagline },
  };
}

export default async function SkillDetail({ params }: Props) {
  const { slug } = await params;
  const s = getSkill(slug);
  if (!s) notFound();

  const related = AI_SKILLS.filter((x) => x.category === s.category && x.name !== s.name).slice(0, 6);
  const url = `${APP_URL}/skills/${slug}`;
  const answer = `${s.tagline} ${s.description}`;
  const platformLabel = PLATFORM_LABEL[s.platform];

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: s.name,
    description: s.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: s.platform === "Multi" ? "Any" : s.platform,
    url: s.url,
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is ${s.name}?`, acceptedAnswer: { "@type": "Answer", text: answer } },
      { "@type": "Question", name: `What platform does ${s.name} run on?`, acceptedAnswer: { "@type": "Answer", text: `${s.name} is a ${platformLabel}.` } },
    ],
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AI skills", item: `${APP_URL}/skills` },
      { "@type": "ListItem", position: 2, name: s.name, item: url },
    ],
  };

  const factLabel = { fontSize: "12px", color: "#737373", fontWeight: 500 };
  const factValue = { fontSize: "13.5px", color: "#cbc7bf", fontWeight: 500 };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Link href="/skills" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: "#a3a3a3", textDecoration: "none", margin: "0 0 18px" }}>
        <ArrowLeft size={14} strokeWidth={2.3} /> AI skills
      </Link>

      <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD }}>
        <span aria-hidden>{SKILL_CATEGORY_EMOJI[s.category]}</span>{s.category} · {platformLabel}
      </span>
      <h1 style={{ fontFamily: SG, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f6f4f0", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "12px 0 0" }}>
        {s.name}
      </h1>

      <p style={{ fontSize: "17px", color: "#d5d2cb", lineHeight: 1.65, margin: "16px 0 0", maxWidth: "600px" }}>{answer}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", margin: "22px 0 0", padding: "16px 20px", border: `1px solid ${HAIRLINE}`, borderRadius: "14px", background: "rgba(255,255,255,0.025)" }}>
        <span><span style={factLabel}>Use case</span><br /><span style={factValue}>{s.category}</span></span>
        <span><span style={factLabel}>Platform</span><br /><span style={factValue}>{platformLabel}</span></span>
        <span><span style={factLabel}>Price</span><br /><span style={factValue}>Free</span></span>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "20px 0 0" }}>
        <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: "#f5f5f5", borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
          <ArrowUpRight size={16} strokeWidth={2.2} /> Open {s.name}
        </a>
        <Link href="/skills" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#cbc7bf", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
          Browse all AI skills
        </Link>
      </div>

      <section style={{ margin: "34px 0 0" }}>
        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", margin: 0 }}>What it does</h2>
        <p style={{ fontSize: "16px", color: "#cbc7bf", lineHeight: 1.7, margin: "12px 0 0" }}>{s.description}</p>
        <p style={{ fontSize: "16px", color: "#cbc7bf", lineHeight: 1.7, margin: "14px 0 0" }}>
          {s.name} runs inside {platformLabel === "Multi-platform" ? "multiple assistants" : platformLabel.replace(" (ChatGPT)", "")}, so you get a specialised assistant for {s.category.toLowerCase()} without writing a custom prompt , open it and start.
        </p>
      </section>

      {related.length > 0 && (
        <section style={{ margin: "34px 0 0" }}>
          <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", margin: "0 0 14px" }}>Related {s.category.toLowerCase()} skills</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {related.map((r) => (
              <li key={r.name}>
                <Link href={`/skills/${slugify(r.name)}`} style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "13px 15px" }}>
                  <span style={{ fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#f5f5f5" }}>{r.name}</span>
                  <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", lineHeight: 1.4, marginTop: "3px" }}>{r.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
