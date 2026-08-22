"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { entityHref, type EntityType } from "@/lib/entities";
import { conceptVisual } from "@/lib/learn-visuals";
import styles from "./explore.module.css";

export interface EntityLite {
  slug: string;
  canonicalName: string;
  entityType: EntityType;
  shortDesc: string | null;
  mentionCount: number;
}

type Filter = "all" | "concept" | "technique";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "concept", label: "Concepts" },
  { key: "technique", label: "Techniques" },
];

function ConceptCard({ e }: { e: EntityLite }) {
  const { Icon, accent, soft } = conceptVisual(e.slug, e.entityType);
  const typeLabel = e.entityType === "technique" ? "Technique" : "Concept";
  return (
    <Link href={entityHref(e)} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.iconTile} style={{ background: soft, color: accent }}>
          <Icon size={22} strokeWidth={2} />
        </span>
        <ArrowUpRight className={styles.cardArrow} size={18} strokeWidth={2} />
      </div>
      <div className={styles.cardName}>{e.canonicalName}</div>
      {e.shortDesc && <div className={styles.cardDesc}>{e.shortDesc}</div>}
      <div className={styles.cardMeta}>
        <span className={styles.cardType} style={{ color: accent }}>
          {typeLabel}
        </span>
        {e.mentionCount > 0 && (
          <span>
            · {e.mentionCount} {e.mentionCount === 1 ? "story" : "stories"}
          </span>
        )}
      </div>
    </Link>
  );
}

export function ExploreClient({ entities }: { entities: EntityLite[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const featured = entities[0];
  const rest = entities.slice(1);

  const shown = useMemo(
    () => (filter === "all" ? rest : rest.filter((e) => e.entityType === filter)),
    [rest, filter]
  );

  const concepts = shown.filter((e) => e.entityType === "concept");
  const techniques = shown.filter((e) => e.entityType === "technique");

  const groups: { label: string; items: EntityLite[] }[] =
    filter === "all"
      ? [
          { label: "Concepts", items: concepts },
          { label: "Techniques", items: techniques },
        ]
      : [{ label: filter === "concept" ? "Concepts" : "Techniques", items: shown }];

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>The AI glossary</span>
        <h1 className={styles.title}>Understand the ideas behind the news.</h1>
        <p className={styles.deck}>
          Plain-English explainers for the concepts and techniques shaping AI, each one tied to the
          latest news as it happens.
        </p>
        <p className={styles.count}>
          {entities.length} {entities.length === 1 ? "concept" : "concepts"} explained
        </p>
      </header>

      {featured && <FeaturedCard e={featured} />}

      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`${styles.chip} ${filter === f.key ? styles.chipActive : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.map((g) =>
        g.items.length > 0 ? (
          <section key={g.label} className={styles.group}>
            <h2 className={styles.groupLabel}>{g.label}</h2>
            <div className={styles.grid}>
              {g.items.map((e) => (
                <ConceptCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </>
  );
}

function FeaturedCard({ e }: { e: EntityLite }) {
  const { Icon, accent, soft } = conceptVisual(e.slug, e.entityType);
  return (
    <Link href={entityHref(e)} className={styles.featured}>
      <span
        className={styles.featuredIcon}
        style={{ background: soft, color: accent, borderColor: soft }}
      >
        <Icon size={30} strokeWidth={1.9} />
      </span>
      <div className={styles.featuredBody}>
        <span className={styles.featuredKicker} style={{ color: accent }}>
          Start here
        </span>
        <div className={styles.featuredName}>{e.canonicalName}</div>
        {e.shortDesc && <p className={styles.featuredDesc}>{e.shortDesc}</p>}
        <span className={styles.featuredCta} style={{ color: accent }}>
          Read the concept
          <ArrowRight size={16} strokeWidth={2.2} />
        </span>
      </div>
    </Link>
  );
}
