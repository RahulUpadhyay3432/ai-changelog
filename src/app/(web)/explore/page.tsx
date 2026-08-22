import type { Metadata } from "next";
import { entityHref } from "@/lib/entities";
import { getLearnEntities } from "@/lib/knowledge";
import { ExploreClient, type EntityLite } from "./ExploreClient";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explore AI concepts",
  description:
    "The Kapyn AI glossary, plain-English explainers for the models, tools, and techniques shaping AI, each tied to the latest news.",
  alternates: { canonical: `${APP_URL}/explore` },
  openGraph: {
    title: "Explore AI concepts, Kapyn",
    description:
      "Plain-English explainers for the concepts shaping AI, each tied to the latest news.",
    url: `${APP_URL}/explore`,
    siteName: "Kapyn",
    type: "website",
  },
};

export default async function ExplorePage() {
  const entities = await getLearnEntities(60);

  const items: EntityLite[] = entities.map((e) => ({
    slug: e.slug,
    canonicalName: e.canonicalName,
    entityType: e.entityType,
    shortDesc: e.shortDesc,
    mentionCount: e.mentionCount,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Kapyn AI Glossary",
    description:
      "Plain-English explainers for the concepts and techniques shaping AI, each tied to the latest news.",
    url: `${APP_URL}/explore`,
    hasDefinedTerm: items.map((e) => ({
      "@type": "DefinedTerm",
      name: e.canonicalName,
      url: `${APP_URL}${entityHref(e)}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <ExploreClient entities={items} />
    </>
  );
}
