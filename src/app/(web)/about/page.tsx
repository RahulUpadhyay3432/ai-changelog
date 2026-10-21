import type { Metadata } from "next";
import Link from "next/link";
import { GOLD, HAIRLINE, SG, SURFACE, TEXT } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";
import { TAGLINE } from "@/lib/brand";

// Who runs Kapyn and what it is for. /about was a 404 until now, which is a
// strange gap for a product whose whole claim is curation you can trust.
//
// TODO (owner): add the maintainer's name and a contact address. A trust page
// that will not say who is behind it does half its job.

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

const DESC =
  "What Kapyn is, who maintains it, and the commitments behind it: no paywall, no paid placement, no affiliate rankings.";

export const metadata: Metadata = {
  title: "About Kapyn",
  description: DESC,
  alternates: { canonical: `${APP_URL}/about` },
  openGraph: { title: "About Kapyn", description: DESC, url: `${APP_URL}/about`, siteName: "Kapyn", type: "article" },
};

const COMMITMENTS = [
  {
    title: "No paywall, no signup wall",
    body: "Everything on Kapyn is readable without an account. Saves and loadouts live in your browser's own storage, which is also why they do not follow you between devices yet.",
  },
  {
    title: "No paid placement, no affiliate rankings",
    body: "Nothing on the Radar is there because someone paid for it, and no outbound link carries an affiliate or referral parameter. Nobody has ever been charged for a listing. If that changes, this page changes first and the label goes on the entry.",
  },
  {
    title: "Sources stay visible",
    body: "Every story links out to the publisher that reported it, and every explainer lists the stories it was built from. The point is for you to be able to check us.",
  },
  {
    title: "Calm by construction",
    body: "No streak guilt, no infinite scroll, no notification pressure. The feed ends, and when it does it says so.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Kapyn",
    description: DESC,
    url: `${APP_URL}/about`,
    publisher: { "@id": `${APP_URL}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <article style={{ maxWidth: "680px", padding: "40px 0 72px" }}>
        <h1 style={{ fontFamily: SG, fontSize: "34px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.035em", lineHeight: 1.08, margin: "0 0 14px" }}>
          About Kapyn
        </h1>
        <p style={{ fontSize: "17px", color: TEXT.body, lineHeight: 1.62, margin: "0 0 28px" }}>
          {TAGLINE}. Kapyn keeps a curated map of the agents, models, tools, MCP servers and
          skills that are actually worth your attention, and a 30-second daily brief on what
          changed. Discovery is the product; the news is the signal that keeps it current.
        </p>

        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: "36px 0 10px" }}>
          Why it exists
        </h2>
        <p style={{ fontSize: "15.5px", color: TEXT.body, lineHeight: 1.65, margin: "0 0 14px" }}>
          There is no shortage of AI information. There is a shortage of ways to tell what
          matters without reading for an hour. Most tool directories solve the opposite
          problem: they index everything, rank by whoever pays, and leave you exactly as
          undecided as you arrived.
        </p>
        <p style={{ fontSize: "15.5px", color: TEXT.body, lineHeight: 1.65, margin: 0 }}>
          Kapyn is the narrow version. A bounded, hand-kept catalog, a brief you can finish,
          and an honest account of how both are made, which is on the{" "}
          <Link href="/methodology" style={{ color: GOLD, textDecoration: "none" }}>methodology page</Link>.
        </p>

        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: "36px 0 10px" }}>
          Who makes it
        </h2>
        <p style={{ fontSize: "15.5px", color: TEXT.body, lineHeight: 1.65, margin: 0 }}>
          Kapyn is an independent project, built and maintained by one developer in Bangalore,
          India. It is not venture funded and has no team behind it, which is the honest
          explanation for both its speed and its rough edges. Catalog entries are written by
          hand; story summaries are drafted by a language model and filtered before publication,
          described in full on the methodology page.
        </p>

        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: "36px 0 14px" }}>
          What we commit to
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {COMMITMENTS.map((c) => (
            <li key={c.title} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "16px 18px" }}>
              <h3 style={{ fontFamily: SG, fontSize: "15px", fontWeight: 700, color: TEXT.primary, margin: "0 0 5px" }}>{c.title}</h3>
              <p style={{ fontSize: "14.5px", color: TEXT.muted, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
            </li>
          ))}
        </ul>

        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: "36px 0 10px" }}>
          Corrections
        </h2>
        <p style={{ fontSize: "15.5px", color: TEXT.body, lineHeight: 1.65, margin: 0 }}>
          Things go stale and things go wrong: a tool gets renamed, a model is superseded, a
          summary lands wide of what the source said. Corrections are made in place rather than
          quietly deleted, and the comparison pages carry the date they were last reviewed. If
          you find something wrong, say so and it gets fixed.
        </p>
      </article>
    </>
  );
}
