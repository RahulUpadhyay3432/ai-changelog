import type { Metadata } from "next";
import Link from "next/link";
import { entityHref } from "@/lib/entities";
import { getLearnEntities } from "@/lib/knowledge";

const APP_URL = "https://kapyn.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explore AI concepts — Kapyn",
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
      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 40px)",
          fontWeight: 600,
          color: "#E8E4DE",
          letterSpacing: "-0.02em",
          margin: "0 0 12px",
        }}
      >
        The AI glossary
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: "#a3a3a3", margin: "0 0 40px", maxWidth: 560 }}>
        Plain-English explainers for the concepts and techniques shaping AI — each one tied to the
        latest news as it happens.
      </p>

      {entities.length === 0 ? (
        <p style={{ color: "#525252", fontSize: 15 }}>Concepts are being generated. Check back shortly.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {entities.map((e) => (
            <Link
              key={e.slug}
              href={entityHref(e)}
              style={{
                textDecoration: "none",
                display: "block",
                padding: "16px 18px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: "#E8E4DE", marginBottom: 6, letterSpacing: "-0.01em" }}>
                {e.canonicalName}
              </div>
              {e.shortDesc && (
                <div style={{ fontSize: 13, color: "#737373", lineHeight: 1.5 }}>
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
