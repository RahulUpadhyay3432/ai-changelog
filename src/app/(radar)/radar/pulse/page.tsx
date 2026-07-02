import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { entityHref, type EntityType } from "@/lib/entities";
import { getRadarTools, getRadarCards, getRadarMcpDiscovered } from "@/lib/knowledge";
import { EmailCapture } from "@/components/EmailCapture";
import styles from "./pulse.module.css";

const APP_URL = "https://kapyn.app";

// The weekly Pulse — momentum, not inventory. Trending tools (radar_tools, kept
// current by the daily tools cron) + newly-discovered MCP servers + the concepts
// the news is actually talking about this week. Server-rendered, ISR every 30m.
export const revalidate = 1800;

const DESC =
  "What's gaining momentum in AI right now — the tools, MCP servers, and stories trending this week. Refreshed daily, no hype.";

export const metadata: Metadata = {
  title: "This Week in AI — trending tools, MCP servers & stories",
  description: DESC,
  alternates: { canonical: `${APP_URL}/radar/pulse` },
  openGraph: {
    title: "This Week in AI — Kapyn Pulse",
    description: DESC,
    url: `${APP_URL}/radar/pulse`,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "This Week in AI — Kapyn Pulse", description: DESC },
};

function isLearnType(t: EntityType): boolean {
  return t === "technique" || t === "concept";
}

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

export default async function PulsePage() {
  const [tools, discovered, cards] = await Promise.all([
    getRadarTools(24),
    getRadarMcpDiscovered(8),
    getRadarCards(7, 2, 14),
  ]);

  // "In the conversation" — entities with a usable one-liner + a valid link
  // (latest story always resolves; /tools isn't shipped yet, so non-learn
  // entities without a story are dropped to avoid dead links).
  const talking = cards
    .map((c) => {
      const desc = c.valueLine ?? c.entity.shortDesc ?? "";
      const href = c.latestStory
        ? `/story/${c.latestStory.id}`
        : isLearnType(c.entity.entityType)
          ? entityHref(c.entity)
          : null;
      return { name: c.entity.canonicalName, desc, href, isNew: c.isNew };
    })
    .filter((x) => x.href && x.desc)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending AI tools this week",
    description: DESC,
    url: `${APP_URL}/radar/pulse`,
    itemListElement: tools.slice(0, 20).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: t.url,
      description: t.valueLine,
    })),
  };

  return (
    <div className={styles.wrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className={styles.header}>
        <span className={styles.kicker}>Pulse</span>
        <h1 className={styles.title}>This week in AI</h1>
        <p className={styles.deck}>
          What&apos;s gaining momentum right now — the tools, MCP servers, and stories on the rise. Momentum,
          not a directory. Refreshed daily.
        </p>
      </header>

      {/* ── Trending tools ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>🔥 Trending tools</h2>
          {tools.length > 0 && <span className={styles.sectionCount}>{tools.length}</span>}
        </div>
        {tools.length === 0 ? (
          <p className={styles.empty}>The weekly trending set is refreshing — check back shortly.</p>
        ) : (
          <div className={styles.grid}>
            {tools.map((t) => (
              <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{t.name}</span>
                  <ArrowUpRight className={styles.cardArrow} size={16} strokeWidth={2} />
                </div>
                <p className={styles.cardDesc}>{t.valueLine}</p>
                {t.meta && (
                  <div className={styles.cardMeta}>
                    <span className={styles.metric}>{t.meta}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── New MCP servers (appears once the MCP cron has run) ── */}
      {discovered.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>🧩 New MCP servers</h2>
            <span className={styles.sectionCount}>{discovered.length}</span>
          </div>
          <div className={styles.grid}>
            {discovered.map((m) => (
              <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{m.name}</span>
                  <ArrowUpRight className={styles.cardArrow} size={16} strokeWidth={2} />
                </div>
                <p className={styles.cardDesc}>{m.tagline}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.metric}>{compact(m.score)} stars</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── What the news is talking about ── */}
      {talking.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>📰 In the conversation</h2>
            <span className={styles.sectionCount}>{talking.length}</span>
          </div>
          <div className={styles.grid}>
            {talking.map((e) => (
              <Link key={e.name} href={e.href!} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{e.name}</span>
                  {e.isNew && <span className={styles.badge}>New</span>}
                </div>
                <p className={styles.cardDesc}>{e.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Weekly digest opt-in ── */}
      <section className={styles.subscribe}>
        <h2 className={styles.subTitle}>Get this weekly, in your inbox</h2>
        <p className={styles.subDeck}>
          One calm email every Monday — the AI stories and tools that actually mattered. No hype, no noise.
        </p>
        <EmailCapture source="pulse" />
      </section>

      <p className={styles.foot}>
        Refreshed daily from GitHub, Product Hunt, the official MCP registry, and Kapyn&apos;s news stream.
        Ranked by momentum — new and fast-rising, not just popular.
      </p>
    </div>
  );
}
