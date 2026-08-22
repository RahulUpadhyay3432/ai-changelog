import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getAllTools, getToolBySlug, kindLabel, type UnifiedTool } from "@/lib/tools-registry";
import { GOLD, HAIRLINE, SG, SURFACE, TEXT } from "@/lib/design-tokens";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

// A page listing one or two alternatives is thin, and thin pages are the actual
// SEO risk — not the pattern itself. Below this, the route 404s rather than
// publishing filler.
const MIN_ALTERNATIVES = 3;

/**
 * Same-category peers only.
 *
 * Deliberately NOT `similarTools()`, which pads out of category when a category
 * is small — fine for a "you might also like" rail, wrong here. A page titled
 * "X alternatives" that lists an image generator as an alternative to a voice
 * tool is inaccurate, and inaccurate beats thin as an SEO problem. Categories
 * with fewer than four members (Payments, Writing & content, Data & sheets,
 * Marketing & social) simply get no page — 11 of 265 tools.
 */
function alternativesFor(tool: UnifiedTool, n = 6): UnifiedTool[] {
  return getAllTools()
    .filter((t) => t.slug !== tool.slug && t.category === tool.category)
    .slice(0, n);
}

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllTools()
    .filter((t) => alternativesFor(t).length >= MIN_ALTERNATIVES)
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Not found", robots: { index: false, follow: true } };
  const alts = alternativesFor(tool);
  if (alts.length < MIN_ALTERNATIVES) return { title: "Not found", robots: { index: false, follow: true } };

  const url = `${APP_URL}/tools/${slug}/alternatives`;
  const title = `${tool.name} alternatives — ${alts.length} options worth considering`;
  const description = `Curated alternatives to ${tool.name}, hand-checked rather than scraped. ${alts
    .slice(0, 3)
    .map((a) => a.name)
    .join(", ")} and more.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Kapyn", type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ToolAlternatives({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const alts = alternativesFor(tool);
  if (alts.length < MIN_ALTERNATIVES) notFound();

  const url = `${APP_URL}/tools/${slug}/alternatives`;
  // 40-word extractable answer — the thing an AI fetcher or a snippet will lift.
  const answer = `The best ${tool.name} alternatives are ${alts
    .map((a) => a.name)
    .join(", ")}. All sit in ${tool.category} and are curated by hand, so each one is a genuine substitute rather than a directory listing.`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${tool.name} alternatives`,
    numberOfItems: alts.length,
    itemListElement: alts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name,
      description: a.valueLine,
      url: `${APP_URL}/tools/${a.slug}`,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${APP_URL}/tools` },
      { "@type": "ListItem", position: 2, name: tool.name, item: `${APP_URL}/tools/${slug}` },
      { "@type": "ListItem", position: 3, name: "Alternatives", item: url },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Link
        href={`/tools/${slug}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG,
          fontSize: "13px", fontWeight: 600, color: TEXT.muted, textDecoration: "none", margin: "0 0 18px",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.3} /> {tool.name}
      </Link>

      <span style={{ display: "block", fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD }}>
        {kindLabel(tool.kind)} · {tool.category}
      </span>
      <h1
        style={{
          fontFamily: SG, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700,
          color: TEXT.primary, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "12px 0 0",
        }}
      >
        {tool.name} alternatives
      </h1>

      <p style={{ fontSize: "17px", color: "#d5d2cb", lineHeight: 1.65, margin: "16px 0 0", maxWidth: "620px" }}>
        {answer}
      </p>

      <section style={{ margin: "32px 0 0" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {alts.map((a, i) => (
            <li key={a.slug}>
              <Link
                href={`/tools/${a.slug}`}
                style={{
                  display: "block", textDecoration: "none", background: SURFACE,
                  border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "15px 17px",
                }}
              >
                <span style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
                  <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, color: TEXT.muted }}>
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: SG, fontSize: "16px", fontWeight: 600, color: TEXT.primary }}>
                    {a.name}
                  </span>
                  <span style={{ fontSize: "12px", color: TEXT.muted }}>{kindLabel(a.kind)}</span>
                </span>
                <span style={{ display: "block", fontSize: "14px", color: "#a3a3a3", lineHeight: 1.5, marginTop: "5px" }}>
                  {a.valueLine}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ margin: "30px 0 0" }}>
        <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.65, maxWidth: "620px" }}>
          Every entry here is hand-checked — we sweep the catalog for dead links and stale
          entries rather than scraping a registry. That is the whole difference between this
          and a directory with twelve thousand listings, most of which no longer resolve.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "18px 0 0" }}>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG,
              fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: "#f5f5f5",
              borderRadius: "12px", padding: "11px 18px", textDecoration: "none",
            }}
          >
            <ArrowUpRight size={16} strokeWidth={2.2} /> Visit {tool.name}
          </a>
          <Link
            href="/tools"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG,
              fontSize: "14px", fontWeight: 600, color: "#cbc7bf",
              border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "11px 18px", textDecoration: "none",
            }}
          >
            Browse the full catalog
          </Link>
        </div>
      </section>
    </article>
  );
}
