import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { SEED_SLUGS, entityHref, type EntityType } from "@/lib/entities";
import { conceptVisual } from "@/lib/learn-visuals";
import {
  getEntityBySlug,
  getPublishedExplainer,
  getStoriesForEntity,
  getEntitiesBySlugs,
} from "@/lib/knowledge";
import styles from "./learn.module.css";

const APP_URL = "https://kapyn.app";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  // Page <title> is templated to "… | Kapyn" by the root layout; OG/Twitter
  // aren't templated, so they carry the branded suffix explicitly.
  const title = `${entity.canonicalName}: what it is and why it matters`;
  const socialTitle = `${title} — Kapyn`;
  const url = `${APP_URL}/learn/${entity.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // Keep thin (pre-explainer) pages out of the index until they're filled in.
    robots: explainer ? undefined : { index: false, follow: true },
    openGraph: { title: socialTitle, description, url, siteName: "Kapyn", type: "article" },
    twitter: { card: "summary_large_image", title: socialTitle, description },
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
  const visual = conceptVisual(entity.slug, entity.entityType);
  const { Icon, accent, soft } = visual;
  const typeLabel = entity.entityType === "technique" ? "Technique" : "Concept";

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

  const sectionDefs: { id: string; heading: string; body: string | null | undefined }[] = [
    { id: "why-it-matters", heading: "Why it matters", body: explainer?.whyItMatters },
    { id: "how-it-works", heading: "How it works", body: explainer?.howItWorks },
    { id: "whats-happening-now", heading: "What's happening now", body: explainer?.currentDevelopments },
  ];
  const sections = sectionDefs.filter((s) => s.body);

  const toc = [
    ...sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(stories.length > 0 ? [{ id: "in-the-news", label: "In the news" }] : []),
  ];

  return (
    <div className={styles.layout}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.article}>
        <Link href="/explore" className={styles.back}>
          <ChevronLeft size={14} strokeWidth={2.5} />
          Explore
        </Link>

        {/* ── Hero ── */}
        <div className={styles.headerRow}>
          <span className={styles.iconBadge} style={{ background: soft, color: accent }}>
            <Icon size={26} strokeWidth={2} />
          </span>
          <span className={styles.eyebrow} style={{ color: accent, background: soft }}>
            {typeLabel}
          </span>
        </div>

        <h1 className={styles.title}>{entity.canonicalName}</h1>

        {lead && <p className={styles.deck}>{lead}</p>}

        {explainer && (
          <p className={styles.payoff} style={{ color: accent }}>
            You can now explain {entity.canonicalName} — what it is, how it works, and why it matters.
          </p>
        )}

        <hr className={styles.rule} style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />

        {sections.map((s) => (
          <section key={s.id} id={s.id} className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionMark} style={{ background: accent }} />
              {s.heading}
            </h2>
            <p className={styles.body}>{s.body}</p>
          </section>
        ))}

        {!explainer && (
          <p className={styles.pending}>
            A full explainer for this concept is being written. In the meantime, here&apos;s what&apos;s
            in the news.
          </p>
        )}

        {stories.length > 0 && (
          <section id="in-the-news" className={styles.metaBlock}>
            <h2 className={styles.metaHeading}>In the news</h2>
            <div className={styles.storyList}>
              {stories.map((story) => (
                <Link key={story.id} href={`/story/${story.id}`} className={styles.storyLink}>
                  <div className={styles.storyTitle}>{story.title}</div>
                  <div className={styles.storyMeta}>
                    {story.sourceName} · {formatDate(story.publishedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Provenance — the trust signal AI chat structurally cannot offer. */}
        {explainer && (
          <p className={styles.provenance}>
            Auto-generated from Kapyn&apos;s news stream
            {stories.length > 0
              ? ` · grounded in ${stories.length} source${stories.length === 1 ? "" : "s"}`
              : ""}
            {` · updated ${formatDate(explainer.updatedAt)}`}
          </p>
        )}
      </article>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        {toc.length > 0 && (
          <nav className={styles.toc}>
            <div className={styles.sidebarLabel}>On this page</div>
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} className={styles.tocLink}>
                {t.label}
              </a>
            ))}
          </nav>
        )}

        {explainer && (
          <div className={styles.trust}>
            <ShieldCheck size={17} strokeWidth={2} style={{ color: accent, flexShrink: 0 }} />
            <div>
              {stories.length > 0
                ? `Grounded in ${stories.length} source${stories.length === 1 ? "" : "s"}`
                : "From Kapyn's news stream"}
              <span className={styles.trustSub}>Updated {formatDate(explainer.updatedAt)}</span>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className={styles.relatedBlock}>
            <div className={styles.sidebarLabel}>Related</div>
            {related.map((r) => {
              const rv = conceptVisual(r.slug, r.entityType);
              return (
                <Link key={r.slug} href={entityHref(r)} className={styles.relatedCard}>
                  <span
                    className={styles.relatedIcon}
                    style={{ background: rv.soft, color: rv.accent }}
                  >
                    <rv.Icon size={16} strokeWidth={2} />
                  </span>
                  <span className={styles.relatedName}>{r.canonicalName}</span>
                  <ArrowUpRight size={14} strokeWidth={2} className={styles.relatedArrow} />
                </Link>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}
