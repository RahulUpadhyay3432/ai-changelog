import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SEED_SLUGS, entityHref, type EntityType } from "@/lib/entities";
import {
  getEntityBySlug,
  getPublishedExplainer,
  getStoriesForEntity,
  getEntitiesBySlugs,
} from "@/lib/knowledge";

const APP_URL = "https://kapyn.app";
const ACCENT = "#7c3aed";
const ACCENT_LABEL = "#c4b5fd";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

// /learn hosts concepts + techniques. Models/tools/companies belong on /tools,
// so requesting one here 404s (no duplicate content).
function isLearnType(t: EntityType): boolean {
  return t === "technique" || t === "concept";
}

// Prebuild the curated seed concepts at build time (no DB dependency); every
// other concept renders on-demand via ISR (dynamicParams).
export function generateStaticParams() {
  return SEED_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity || !isLearnType(entity.entityType)) return {};

  const explainer = await getPublishedExplainer(entity.id);
  const description = (
    explainer?.definition ??
    entity.shortDesc ??
    `${entity.canonicalName}, explained — plus the latest news.`
  ).slice(0, 155);
  const title = `${entity.canonicalName}: what it is and why it matters — Kapyn`;
  const url = `${APP_URL}/learn/${entity.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // Keep thin (pre-explainer) pages out of the index until they're filled in.
    robots: explainer ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, siteName: "Kapyn", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LearnPage({ params }: Props) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity || !isLearnType(entity.entityType)) notFound();

  const [explainer, stories] = await Promise.all([
    getPublishedExplainer(entity.id),
    getStoriesForEntity(entity.id, 8),
  ]);

  // Never render an empty shell.
  if (!explainer && !entity.shortDesc && stories.length === 0) notFound();

  // In M1 there is no /tools route yet, so only surface related concepts/
  // techniques to avoid dead links. (M2 drops this filter when /tools ships.)
  const related = explainer
    ? (await getEntitiesBySlugs(explainer.relatedSlugs)).filter((r) => isLearnType(r.entityType))
    : [];

  const lead = explainer?.definition ?? entity.shortDesc ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entity.canonicalName,
    description: lead,
    url: `${APP_URL}/learn/${entity.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Kapyn AI Glossary",
      url: `${APP_URL}/explore`,
    },
    ...(stories.length > 0
      ? {
          subjectOf: stories.map((s) => ({
            "@type": "NewsArticle",
            headline: s.title,
            url: `${APP_URL}/story/${s.id}`,
          })),
        }
      : {}),
  };

  const sections: { heading: string; body: string | null | undefined }[] = [
    { heading: "Why it matters", body: explainer?.whyItMatters },
    { heading: "How it works", body: explainer?.howItWorks },
    { heading: "What's happening now", body: explainer?.currentDevelopments },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/explore"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          color: "#525252",
          fontSize: 13,
          textDecoration: "none",
          marginBottom: 24,
        }}
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
        Explore
      </Link>

      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: ACCENT_LABEL,
          background: `${ACCENT}15`,
          border: `1px solid ${ACCENT}30`,
          padding: "3px 10px",
          borderRadius: 100,
          marginBottom: 16,
        }}
      >
        {entity.entityType}
      </span>

      <h1
        style={{
          fontSize: "clamp(30px, 5vw, 44px)",
          fontWeight: 600,
          color: "#E8E4DE",
          lineHeight: 1.15,
          margin: "0 0 20px",
          letterSpacing: "-0.02em",
        }}
      >
        {entity.canonicalName}
      </h1>

      {lead && (
        <p style={{ fontSize: 19, lineHeight: 1.6, color: "#d4d4d4", margin: "0 0 32px" }}>
          {lead}
        </p>
      )}

      {sections.map((s) =>
        s.body ? (
          <section key={s.heading} style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: ACCENT_LABEL,
                margin: "0 0 8px",
              }}
            >
              {s.heading}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#b4b4b4", margin: 0 }}>{s.body}</p>
          </section>
        ) : null
      )}

      {stories.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#737373",
              margin: "0 0 12px",
            }}
          >
            In the news
          </h2>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E4DE", lineHeight: 1.4, marginBottom: 4 }}>
                  {story.title}
                </div>
                <div style={{ fontSize: 12, color: "#525252" }}>
                  {story.sourceName} ·{" "}
                  {new Date(story.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#737373",
              margin: "0 0 12px",
            }}
          >
            Related
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {related.map((r) => (
              <Link
                key={r.slug}
                href={entityHref(r)}
                style={{
                  fontSize: 14,
                  color: "#d4d4d4",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 100,
                  padding: "6px 14px",
                }}
              >
                {r.canonicalName}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
