import type { Metadata } from "next";
import Link from "next/link";
import { entityHref } from "@/lib/entities";
import { getLearnEntities } from "@/lib/knowledge";
import styles from "./explore.module.css";

const APP_URL = "https://kapyn.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explore AI concepts",
  description:
    "The Kapyn AI glossary — plain-English explainers for the models, tools, and techniques shaping AI, each tied to the latest news.",
  alternates: { canonical: `${APP_URL}/explore` },
  openGraph: {
    title: "Explore AI concepts — Kapyn",
    description:
      "Plain-English explainers for the concepts shaping AI, each tied to the latest news.",
    url: `${APP_URL}/explore`,
    siteName: "Kapyn",
    type: "website",
  },
};

export default async function ExplorePage() {
  const entities = await getLearnEntities(60);

  return (
    <>
      <header className={styles.hero}>
        <h1 className={styles.title}>The AI glossary</h1>
        <p className={styles.deck}>
          Plain-English explainers for the concepts and techniques shaping AI — each one tied to the
          latest news as it happens.
        </p>
      </header>

      {entities.length === 0 ? (
        <p className={styles.empty}>Concepts are being generated. Check back shortly.</p>
      ) : (
        <div className={styles.grid}>
          {entities.map((e) => (
            <Link key={e.slug} href={entityHref(e)} className={styles.card}>
              <div className={styles.cardName}>{e.canonicalName}</div>
              {e.shortDesc && (
                <div className={styles.cardDesc}>
                  {e.shortDesc.length > 96 ? e.shortDesc.slice(0, 93) + "…" : e.shortDesc}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
