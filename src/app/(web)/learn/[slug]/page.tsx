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
  getLearnEntities,
} from "@/lib/knowledge";
import { AppCta } from "@/components/web/AppCta";
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

  const [explainer, stories, glossary] = await Promise.all([
    getPublishedExplainer(entity.id),
    getStoriesForEntity(entity.id, 8),
    getLearnEntities(200),
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
      <div className={styles.shell}>
        <nav className={styles.glossaryNav} aria-label="All concepts">
          <div className={styles.navLabel}>Glossary</div>
          <ul className={styles.navList}>
            {glossary.map((g) => (
              <li key={g.slug}>
                <Link
                  href={entityHref(g)}
                  className={g.slug === entity.slug ? styles.navItemActive : styles.navItem}
                >
                  {g.canonicalName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className={styles.article}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Link href="/explore" className={styles.back}>
            <ChevronLeft size={14} strokeWidth={2.5} />
            Explore
          </Link>

          <div>
            <span className={styles.eyebrow}>{entity.entityType}</span>
          </div>

          <h1 className={styles.title}>{entity.canonicalName}</h1>

          {lead && <p className={styles.deck}>{lead}</p>}

          <hr className={styles.rule} />

          {sections.map((s) =>
            s.body ? (
              <section key={s.heading} className={styles.section}>
                <h2 className={styles.sectionHeading}>{s.heading}</h2>
                <p className={styles.body}>{s.body}</p>
              </section>
            ) : null
          )}

          {stories.length > 0 && (
            <section className={styles.metaBlock}>
              <h2 className={styles.metaHeading}>In the news</h2>
              {stories.map((story) => (
                <Link key={story.id} href={`/story/${story.id}`} className={styles.storyLink}>
                  <div className={styles.storyTitle}>{story.title}</div>
                  <div className={styles.storyMeta}>
                    {story.sourceName} · {formatDate(story.publishedAt)}
                  </div>
                </Link>
              ))}
            </section>
          )}

          {related.length > 0 && (
            <section className={styles.metaBlock}>
              <h2 className={styles.metaHeading}>Related</h2>
              <div className={styles.chips}>
                {related.map((r) => (
                  <Link key={r.slug} href={entityHref(r)} className={styles.chip}>
                    {r.canonicalName}
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

        <aside className={styles.rail}>
          <div className={styles.railSticky}>
            <AppCta />
          </div>
        </aside>
      </div>

      {/* Mobile: app CTA below the article (rail is hidden on small screens). */}
      <div className={styles.mobileCta}>
        <AppCta />
      </div>
    </>
  );
}
