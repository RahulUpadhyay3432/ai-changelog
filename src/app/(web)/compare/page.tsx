import type { Metadata } from "next";
import Link from "next/link";
import { CompareClient } from "@/components/compare/CompareClient";
import { MODELS, LAST_UPDATED, CATEGORY_LABELS } from "@/lib/models";
import { GOLD, SG, TEXT } from "@/lib/design-tokens";

const APP_URL = "https://kapyn.app";

export const revalidate = 86400;

const DESC =
  "Compare the major AI models side by side — Claude, GPT, Gemini, Llama, and more — by context window, cost, modalities, and what each is genuinely best for. Calm, sourced, and free.";

export const metadata: Metadata = {
  title: "AI Model Comparison — Claude vs GPT vs Gemini and more",
  description: DESC,
  alternates: { canonical: `${APP_URL}/compare` },
  openGraph: {
    title: "AI Model Comparison — Claude vs GPT vs Gemini and more",
    description: DESC,
    url: `${APP_URL}/compare`,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "AI Model Comparison", description: DESC },
};

const EMBED_SNIPPET = `<iframe src="${APP_URL}/embed/compare" width="100%" height="640" style="border:1px solid #222;border-radius:14px" title="AI Model Comparison by Kapyn" loading="lazy"></iframe>`;

export default function ComparePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Model Comparison",
    description: DESC,
    url: `${APP_URL}/compare`,
    numberOfItems: MODELS.length,
    itemListElement: MODELS.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: m.name,
        applicationCategory: "AI language model",
        operatingSystem: "Web",
        creator: { "@type": "Organization", name: m.provider },
        url: m.providerUrl,
        description: m.bestFor,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ margin: "4px 0 28px" }}>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>
          Compare
        </span>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.06, margin: "10px 0 0", color: TEXT.primary }}>
          AI model comparison
        </h1>
        <p style={{ fontSize: "15px", color: TEXT.muted, lineHeight: 1.55, margin: "12px 0 0", maxWidth: "620px" }}>
          {DESC}
        </p>
        <p style={{ fontSize: "12.5px", color: "var(--kt-text-muted, #8a857c)", lineHeight: 1.5, margin: "12px 0 0", maxWidth: "620px" }}>
          Cost is shown as a tier, not a live price — model pricing moves often, so always confirm current rates on the
          provider&apos;s page before you commit. Last updated {LAST_UPDATED}.
        </p>
      </header>

      <CompareClient />

      {/* Deeper reads */}
      <section style={{ margin: "40px 0 0", paddingTop: "28px", borderTop: "1px solid var(--kt-hairline, rgba(255,255,255,0.09))" }}>
        <h2 style={{ fontFamily: SG, fontSize: "18px", fontWeight: 700, color: TEXT.primary, margin: 0 }}>Go deeper</h2>
        <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.6, margin: "10px 0 0", maxWidth: "620px" }}>
          The matrix is the quick answer. For the reasoning behind a pick, read{" "}
          <Link href="/blog/claude-vs-gpt4o-which-to-use-2026" style={{ color: GOLD, textDecoration: "none" }}>Claude vs GPT-4o</Link>,{" "}
          <Link href="/blog/claude-vs-gemini-which-to-use-2026" style={{ color: GOLD, textDecoration: "none" }}>Claude vs Gemini</Link>, or{" "}
          <Link href="/blog/run-llms-locally-2026" style={{ color: GOLD, textDecoration: "none" }}>running open models locally</Link>. Every category above —{" "}
          {Object.values(CATEGORY_LABELS).join(", ")} — maps to a use case, not a leaderboard rank.
        </p>
      </section>

      {/* Embed */}
      <section style={{ margin: "36px 0 0", paddingTop: "28px", borderTop: "1px solid var(--kt-hairline, rgba(255,255,255,0.09))" }}>
        <h2 style={{ fontFamily: SG, fontSize: "18px", fontWeight: 700, color: TEXT.primary, margin: 0 }}>Embed this comparison</h2>
        <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.6, margin: "10px 0 14px", maxWidth: "620px" }}>
          Free to use on your own site — paste this snippet where you want the live, auto-updating matrix to appear.
        </p>
        <pre style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "12px", color: TEXT.body, background: "var(--kt-code-bg, #141310)", border: "1px solid var(--kt-hairline, rgba(255,255,255,0.09))", borderRadius: "12px", padding: "16px", overflowX: "auto", lineHeight: 1.6, margin: 0, userSelect: "all" }}>
          {EMBED_SNIPPET}
        </pre>
      </section>
    </>
  );
}
