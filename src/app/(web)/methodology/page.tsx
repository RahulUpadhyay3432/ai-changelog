import type { Metadata } from "next";
import Link from "next/link";
import { CURATED_ESSENTIALS } from "@/lib/radar-essentials";
import { MCP_SERVERS } from "@/lib/radar-mcp";
import { AI_SKILLS } from "@/lib/radar-skills";
import { MODELS, LAST_UPDATED } from "@/lib/models";
import { FEED_WINDOW_LABEL } from "@/lib/feed-window";
import { GOLD, HAIRLINE, SG, SURFACE, TEXT } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";

// How the map is actually made. Written because "curated" and "kept current" were
// claimed on every surface and demonstrated on none. Counts are derived from the
// live catalogs, so this page cannot drift from the data it describes.

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

const DESC =
  "How Kapyn selects stories, curates tools, MCP servers and skills, ranks momentum, and keeps model comparisons current. Including what is automated, what is hand-written, and what we do not claim.";

export const metadata: Metadata = {
  title: "How Kapyn is made: selection, curation and freshness",
  description: DESC,
  alternates: { canonical: `${APP_URL}/methodology` },
  openGraph: {
    title: "How Kapyn is made",
    description: DESC,
    url: `${APP_URL}/methodology`,
    siteName: "Kapyn",
    type: "article",
  },
};

export default function MethodologyPage() {
  const officialMcp = MCP_SERVERS.filter((s) => s.by === "official").length;
  const communityMcp = MCP_SERVERS.length - officialMcp;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Kapyn accept paid placement?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Nothing on the Radar is listed because someone paid for it, and no outbound link carries an affiliate or referral parameter.",
        },
      },
      {
        "@type": "Question",
        name: "Are Kapyn's story summaries written by AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Each story is classified and summarised by a language model from the publisher's own feed, then filtered by an automated quality gate before it can reach the feed. Every story links to the original source so you can check it.",
        },
      },
      {
        "@type": "Question",
        name: "How does Kapyn decide what is trending?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stories are scored by how many distinct outlets covered the same lead subject, decayed by age. Tools are ranked by how recently they were seen rising plus their repository or launch score. Neither uses Kapyn's own traffic.",
        },
      },
    ],
  };

  const H2 = { fontFamily: SG, fontSize: "21px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.022em", margin: "40px 0 12px" } as const;
  const P = { fontSize: "15.5px", color: TEXT.body, lineHeight: 1.65, margin: "0 0 14px" } as const;
  const LI = { fontSize: "15px", color: TEXT.body, lineHeight: 1.6, margin: "0 0 9px" } as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />

      <article style={{ maxWidth: "700px", padding: "40px 0 72px" }}>
        <h1 style={{ fontFamily: SG, fontSize: "34px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.035em", lineHeight: 1.08, margin: "0 0 14px" }}>
          How Kapyn is made
        </h1>
        <p style={{ fontSize: "17px", color: TEXT.body, lineHeight: 1.62, margin: "0 0 10px" }}>
          Kapyn claims two things on every page: that it is curated, and that it is kept
          current. This page is the evidence, including the parts that are automated and the
          parts we deliberately do not claim.
        </p>

        {/* The catalog */}
        <h2 style={H2}>The catalog: what is hand-written</h2>
        <p style={P}>
          The spine of the Radar is written by hand, one entry at a time. Right now that is{" "}
          <strong style={{ color: TEXT.primary, fontWeight: 600 }}>{CURATED_ESSENTIALS.length} tools</strong>,{" "}
          <strong style={{ color: TEXT.primary, fontWeight: 600 }}>{MCP_SERVERS.length} MCP servers</strong>{" "}
          ({officialMcp} first-party, {communityMcp} community) and{" "}
          <strong style={{ color: TEXT.primary, fontWeight: 600 }}>{AI_SKILLS.length} skills</strong>. Every
          one has a human-written line saying what it is for. None of them is generated.
        </p>
        <p style={P}>
          These numbers are small on purpose. A bounded list someone has actually read is the
          product; an exhaustive index is what we are trying not to be. It also means the
          catalog has gaps, and a tool missing from it is not a judgement on that tool.
        </p>

        <h2 style={H2}>The catalog: what is discovered automatically</h2>
        <p style={P}>
          Alongside the hand-written spine, a daily job surfaces what is newly rising: GitHub
          repositories, Product Hunt launches and the official MCP registry. These are held to
          a separate standard and labelled differently from curated entries. Registry-discovered
          MCP servers currently need at least 10 stars to appear at all, and a curated entry always wins
          over a discovered duplicate of itself.
        </p>
        <div style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "16px 18px", margin: "0 0 14px" }}>
          <p style={{ fontSize: "14.5px", color: TEXT.muted, lineHeight: 1.6, margin: 0 }}>
            Where a discovered entry shows a star count, that is the count on its GitHub
            repository, not a Kapyn score and not a measure of quality. Several MCP servers can
            live in one repository and therefore share one number.
          </p>
        </div>

        {/* The brief */}
        <h2 style={H2}>The daily brief: how a story gets in</h2>
        <ol style={{ listStyle: "decimal", padding: "0 0 0 22px", margin: "0 0 14px" }}>
          <li style={LI}>
            A scheduled job reads more than thirty publisher feeds, from the labs themselves (OpenAI, Google
            DeepMind, Microsoft Research, Hugging Face, Mistral) through to the technology press,
            plus Product Hunt.
          </li>
          <li style={LI}>
            Duplicates are dropped on the source URL, so the same story cannot appear twice.
          </li>
          <li style={LI}>
            Each item is classified into a category and summarised by a language model, working
            from the publisher&apos;s own text. This step is automated. Summaries are not written
            by a person.
          </li>
          <li style={LI}>
            An automated quality gate then rejects the output: anything the model flagged as
            low-signal or off-topic, anything that leaked the prompt, and raw changelog
            boilerplate. Rejected items are not published at all rather than published badly.
          </li>
          <li style={LI}>
            What survives is stored with its source name and a link out. The live feed shows the
            last {FEED_WINDOW_LABEL}; everything older stays permanently addressable at its own
            story URL.
          </li>
        </ol>
        <p style={P}>
          The honest limitation: a model summarising a headline can be subtly wrong in a way the
          gate will not catch. That is why the source link is on every card and why we would
          rather you click it than trust us.
        </p>

        {/* Momentum */}
        <h2 style={H2}>What &ldquo;trending&rdquo; and &ldquo;momentum&rdquo; mean</h2>
        <p style={P}>
          Neither is based on Kapyn&apos;s own traffic. We do not rank by what our readers click,
          because at our size that would mostly measure noise.
        </p>
        <ul style={{ listStyle: "disc", padding: "0 0 0 22px", margin: "0 0 14px" }}>
          <li style={LI}>
            <strong style={{ color: TEXT.primary, fontWeight: 600 }}>Trending stories</strong> are
            scored by how many distinct outlets covered the same lead subject, multiplied by a
            recency decay. Broad coverage of a fresh subject outranks a single outlet.
          </li>
          <li style={LI}>
            <strong style={{ color: TEXT.primary, fontWeight: 600 }}>Momentum on Pulse</strong> is
            how recently a tool was seen rising, combined with its repository or launch score. It
            favours the new and fast-moving over the merely large, which is the point, and it also
            means an established tool can be absent from Pulse while remaining excellent.
          </li>
        </ul>

        {/* Freshness */}
        <h2 style={H2}>Keeping the model comparisons current</h2>
        <p style={P}>
          The{" "}
          <Link href="/compare" style={{ color: GOLD, textDecoration: "none" }}>comparison pages</Link>{" "}
          track {MODELS.length} model families. They were last reviewed on {LAST_UPDATED}, which is
          printed on the page itself rather than hidden.
        </p>
        <p style={P}>
          Two deliberate choices make that claim survivable. Models are listed by family, with the
          current release as a separate field, so a point upgrade is a one-line edit instead of a
          rewrite. And prices are shown as qualitative tiers with a link to the provider&apos;s live
          pricing page, because a hard per-token figure in our copy goes stale silently and we
          would rather send you to the source of truth.
        </p>
        <p style={P}>
          A check runs in CI and fails the build when the model data has not been reviewed
          recently, when a family has no current release recorded, or when a retired model name
          survives in a live recommendation. What it cannot do is notice that a provider shipped
          something: that still takes a human looking. Treat a review date as &ldquo;recently
          checked&rdquo;, never as a guarantee of being current.
        </p>

        {/* Explainers */}
        <h2 style={H2}>The explainers</h2>
        <p style={P}>
          The{" "}
          <Link href="/explore" style={{ color: GOLD, textDecoration: "none" }}>concept explainers</Link>{" "}
          are generated from stories Kapyn has already ingested, and each one carries the number of
          sources it was built from and the date it was last updated. They are machine-drafted from
          sourced reporting, which is stated on the page, not disguised.
        </p>

        {/* What we don't claim */}
        <h2 style={H2}>What we do not claim</h2>
        <ul style={{ listStyle: "disc", padding: "0 0 0 22px", margin: 0 }}>
          <li style={LI}>Not that the catalog is complete. It is bounded by design and it has gaps.</li>
          <li style={LI}>
            Not that we have tested every tool against its alternatives. The alternatives pages list
            same-category peers from the hand-written catalog; they are a starting point, not a
            verdict on substitutability.
          </li>
          <li style={LI}>Not that summaries are human-written. They are not, and the pipeline above says so.</li>
          <li style={LI}>
            Not that everything is current to the day. Freshness is a job we run, with a date you can
            read, not a property we assert.
          </li>
        </ul>

        <p style={{ fontSize: "14.5px", color: TEXT.muted, lineHeight: 1.6, margin: "32px 0 0", paddingTop: "18px", borderTop: `1px solid ${HAIRLINE}` }}>
          More on who maintains Kapyn and what it commits to:{" "}
          <Link href="/about" style={{ color: GOLD, textDecoration: "none" }}>About Kapyn</Link>.
        </p>
      </article>
    </>
  );
}
