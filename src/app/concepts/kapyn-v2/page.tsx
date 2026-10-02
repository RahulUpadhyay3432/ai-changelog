import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Layers3, Newspaper, Sparkles } from "lucide-react";
import styles from "./prototype.module.css";

export const metadata: Metadata = {
  title: "Kapyn V2 UX concepts",
  description: "Private design exploration for Kapyn's next product shell.",
  robots: { index: false, follow: false },
};

const CONCEPTS = [
  {
    slug: "landing",
    number: "01",
    title: "Landing",
    description: "A shorter promise-led homepage built around the map, the brief, and the user’s toolkit.",
    Icon: Compass,
  },
  {
    slug: "today",
    number: "02",
    title: "Today",
    description: "An inline first-session setup and a calmer daily brief with visible completion.",
    Icon: Newspaper,
  },
  {
    slug: "radar",
    number: "03",
    title: "Radar",
    description: "A decision-first discovery surface using readable rows instead of cramped card inventory.",
    Icon: Sparkles,
  },
  {
    slug: "toolkit",
    number: "04",
    title: "Toolkit",
    description: "An empty state that immediately gives people useful starter stacks to save.",
    Icon: Layers3,
  },
] as const;

export default function KapynV2Index() {
  return (
    <main className={styles.galleryPage}>
      <div className={styles.galleryTopline}>
        <span className={styles.wordmark}>kapyn</span>
        <span className={styles.conceptBadge}>Product concept · October 2026</span>
      </div>

      <section className={styles.galleryIntro}>
        <p className={styles.eyebrow}>A concrete answer to the UX audit</p>
        <h1>One product shell.<br />Four decisive screens.</h1>
        <p>
          This concept keeps Kapyn calm and dark, but replaces the generic AI-blue card wall with
          an editorial signal map: fewer surfaces, clearer hierarchy, and useful first-run states.
        </p>
      </section>

      <section className={styles.galleryList} aria-label="Prototype screens">
        {CONCEPTS.map(({ slug, number, title, description, Icon }) => (
          <Link key={slug} href={`/concepts/kapyn-v2/${slug}`} className={styles.galleryRow}>
            <span className={styles.galleryNumber}>{number}</span>
            <span className={styles.galleryIcon}><Icon size={20} strokeWidth={1.8} /></span>
            <span className={styles.galleryCopy}>
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <ArrowRight className={styles.galleryArrow} size={20} strokeWidth={1.8} />
          </Link>
        ))}
      </section>

      <footer className={styles.galleryFooter}>
        Restrained sage accent · warm charcoal surfaces · Space Grotesk · no production routes changed
      </footer>
    </main>
  );
}
