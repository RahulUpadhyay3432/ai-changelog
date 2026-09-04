import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  MODEL_PAIRS,
  getPair,
  modelById,
  pairSlug,
  relatedPairs,
  type ModelPair,
} from "@/lib/model-pairs";
import { CATEGORY_LABELS, LAST_UPDATED, PRICE_TIER_LABEL, formatContext, type AIModel } from "@/lib/models";
import { GOLD, HAIRLINE, SG } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MODEL_PAIRS.map((p) => ({ slug: pairSlug(p) }));
}

/** Both models for a pair, or undefined if either id has been retired from MODELS. */
function pairModels(pair: ModelPair): [AIModel, AIModel] | undefined {
  const a = modelById(pair.a);
  const b = modelById(pair.b);
  return a && b ? [a, b] : undefined;
}

function headline(a: AIModel, b: AIModel): string {
  return `${a.name} vs ${b.name}`;
}

/** Family names carry the page; the release names carry the search query people type. */
function releaseHeadline(a: AIModel, b: AIModel): string {
  return `${a.currentVersion ?? a.name} vs ${b.currentVersion ?? b.name}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = getPair(slug);
  if (!found) return { title: "Comparison not found", robots: { index: false, follow: true } };
  const models = pairModels(found.pair);
  if (!models) return { title: "Comparison not found", robots: { index: false, follow: true } };
  const [a, b] = models;

  // Always point at the canonical order so the reversed slug does not compete.
  const canonical = `${APP_URL}/compare/${pairSlug(found.pair)}`;
  const title = `${releaseHeadline(a, b)}: which should you use in 2026?`;
  const description = found.pair.verdict.split(". ")[0] + ".";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "Kapyn", type: "article" },
    twitter: { card: "summary", title, description },
  };
}

const factLabel = { fontSize: "12px", color: "#737373", fontWeight: 500 };
const factValue = { fontSize: "13.5px", color: "#cbc7bf", fontWeight: 500 };
const h2 = {
  fontFamily: SG,
  fontSize: "20px",
  fontWeight: 700,
  color: "#f5f5f5",
  letterSpacing: "-0.02em",
  margin: "0 0 14px",
} as const;

function ModelColumn({ m, when }: { m: AIModel; when: string[] }) {
  return (
    <div
      style={{
        flex: "1 1 260px",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: "14px",
        padding: "18px 20px",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <a
        href={m.providerUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: SG,
          fontSize: "17px",
          fontWeight: 700,
          color: "#f6f4f0",
          textDecoration: "none",
        }}
      >
        {m.name}
        <ArrowUpRight size={13} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.6 }} />
      </a>
      <span style={{ display: "block", fontSize: "12.5px", color: "#737373", margin: "3px 0 0" }}>
        {m.currentVersion ? `${m.provider} · ${m.currentVersion}` : m.provider}
      </span>
      <p style={{ fontSize: "14px", color: "#cbc7bf", lineHeight: 1.6, margin: "12px 0 14px" }}>{m.bestFor}</p>
      <span style={{ ...factLabel, display: "block", marginBottom: "7px" }}>Reach for it when</span>
      <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {when.map((w) => (
          <li key={w} style={{ fontSize: "14px", color: "#cbc7bf", lineHeight: 1.55 }}>
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpecRow({ label, av, bv }: { label: string; av: string; bv: string }) {
  return (
    <tr>
      <td style={{ ...factLabel, padding: "10px 14px 10px 0", whiteSpace: "nowrap" }}>{label}</td>
      <td style={{ ...factValue, padding: "10px 14px 10px 0" }}>{av}</td>
      <td style={{ ...factValue, padding: "10px 0" }}>{bv}</td>
    </tr>
  );
}

export default async function ComparePair({ params }: Props) {
  const { slug } = await params;
  const found = getPair(slug);
  if (!found) notFound();
  const models = pairModels(found.pair);
  if (!models) notFound();

  const pair = found.pair;
  const [a, b] = models;
  const url = `${APP_URL}/compare/${pairSlug(pair)}`;
  const related = relatedPairs(pair);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${headline(a, b)}: which is better?`,
        acceptedAnswer: { "@type": "Answer", text: pair.verdict },
      },
      {
        "@type": "Question",
        name: `When should you use ${a.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `${a.bestFor}. Specifically: ${pair.pickA.join("; ")}.` },
      },
      {
        "@type": "Question",
        name: `When should you use ${b.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `${b.bestFor}. Specifically: ${pair.pickB.join("; ")}.` },
      },
    ],
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Compare AI models", item: `${APP_URL}/compare` },
      { "@type": "ListItem", position: 2, name: headline(a, b), item: url },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }} />

      <Link
        href="/compare"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontFamily: SG,
          fontSize: "13px",
          fontWeight: 600,
          color: "#a3a3a3",
          textDecoration: "none",
          margin: "0 0 18px",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.3} /> Compare AI models
      </Link>

      <span style={{ display: "block", fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD }}>
        Head to head
      </span>
      <h1
        style={{
          fontFamily: SG,
          fontSize: "clamp(28px, 5vw, 40px)",
          fontWeight: 700,
          color: "#f6f4f0",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: "12px 0 0",
        }}
      >
        {headline(a, b)}
      </h1>

      {/* Extractable answer — the verdict is the reason this page exists. */}
      <p style={{ fontSize: "17px", color: "#d5d2cb", lineHeight: 1.65, margin: "16px 0 0", maxWidth: "620px" }}>
        {pair.verdict}
      </p>

      {/* Spec table */}
      <div style={{ overflowX: "auto", margin: "26px 0 0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "460px" }}>
          <thead>
            <tr>
              <th style={{ ...factLabel, textAlign: "left", padding: "0 14px 10px 0" }} />
              <th style={{ fontFamily: SG, fontSize: "14px", color: "#f5f5f5", textAlign: "left", padding: "0 14px 10px 0" }}>
                {a.name}
              </th>
              <th style={{ fontFamily: SG, fontSize: "14px", color: "#f5f5f5", textAlign: "left", padding: "0 0 10px" }}>
                {b.name}
              </th>
            </tr>
          </thead>
          <tbody style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            <SpecRow label="Provider" av={a.provider} bv={b.provider} />
            <SpecRow label="Current release" av={a.currentVersion ?? a.name} bv={b.currentVersion ?? b.name} />
            <SpecRow label="Tier" av={CATEGORY_LABELS[a.category]} bv={CATEGORY_LABELS[b.category]} />
            <SpecRow label="Context" av={formatContext(a.contextK)} bv={formatContext(b.contextK)} />
            <SpecRow label="Cost" av={PRICE_TIER_LABEL[a.priceTier]} bv={PRICE_TIER_LABEL[b.priceTier]} />
            <SpecRow label="Modalities" av={a.modalities.join(", ")} bv={b.modalities.join(", ")} />
            <SpecRow label="Open weights" av={a.openWeights ? "Yes" : "No"} bv={b.openWeights ? "Yes" : "No"} />
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "13px", color: "#737373", lineHeight: 1.6, margin: "12px 0 0" }}>
        Cost is a tier, not a quote, providers change prices often. Check{" "}
        <a href={a.pricingUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a3a3a3" }}>
          {a.provider}
        </a>{" "}
        and{" "}
        <a href={b.pricingUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a3a3a3" }}>
          {b.provider}
        </a>{" "}
        before you commit. Last updated {LAST_UPDATED}.
      </p>

      {/* When to pick which */}
      <section style={{ margin: "34px 0 0" }}>
        <h2 style={h2}>Which one to pick</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
          <ModelColumn m={a} when={pair.pickA} />
          <ModelColumn m={b} when={pair.pickB} />
        </div>
      </section>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "24px 0 0" }}>
        <Link
          href="/compare"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            fontFamily: SG,
            fontSize: "14px",
            fontWeight: 600,
            color: "#0a0a0a",
            background: "#f5f5f5",
            borderRadius: "12px",
            padding: "11px 18px",
            textDecoration: "none",
          }}
        >
          See the full model matrix
        </Link>
      </div>

      {related.length > 0 && (
        <section style={{ margin: "34px 0 0" }}>
          <h2 style={h2}>Related comparisons</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {related.map((r) => {
              const rm = pairModels(r);
              if (!rm) return null;
              return (
                <li key={pairSlug(r)}>
                  <Link
                    href={`/compare/${pairSlug(r)}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.025)",
                      border: `1px solid ${HAIRLINE}`,
                      borderRadius: "12px",
                      padding: "13px 15px",
                    }}
                  >
                    <span style={{ fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#f5f5f5" }}>
                      {headline(rm[0], rm[1])}
                    </span>
                    <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", lineHeight: 1.4, marginTop: "3px" }}>
                      {r.verdict.split(". ")[0]}.
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
