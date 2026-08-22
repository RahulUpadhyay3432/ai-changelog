import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { getAllTools, getToolBySlug, getToolBySlugAsync, getPromotedToolPages, similarTools, kindLabel } from "@/lib/tools-registry";
import { getMcpInstall } from "@/lib/mcp-install";
import { McpInstallBlock } from "@/components/mcp/McpInstallBlock";
import { CoverImage } from "@/app/(radar)/radar/radar-shared";
import { GOLD, GOLD_SOFT, GOLD_BORDER, HAIRLINE, SURFACE, SG, TEXT } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";

export const revalidate = 86400;

export async function generateStaticParams() {
  // Curated catalog plus any discovered tool that has earned a page. Promotion
  // is gated on traction and persistence (see knowledge.ts) so this grows on its
  // own without turning into a directory of one-day GitHub spikes.
  const promoted = await getPromotedToolPages();
  return [...getAllTools(), ...promoted].map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function ogImage(url: string): string {
  return `${APP_URL}/api/og-image?url=${encodeURIComponent(url)}`;
}
function favicon(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `/api/favicon?domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlugAsync(slug);
  if (!tool) return { title: "Not found", robots: { index: false, follow: true } };
  const url = `${APP_URL}/tools/${tool.slug}`;
  const title = `${tool.name}, ${kindLabel(tool.kind)}`;
  return {
    title,
    description: tool.valueLine,
    alternates: { canonical: url },
    openGraph: {
      title, description: tool.valueLine, url, siteName: "Kapyn", type: "website",
      images: [{ url: ogImage(tool.url) }],
    },
    twitter: { card: "summary_large_image", title, description: tool.valueLine, images: [ogImage(tool.url)] },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getToolBySlugAsync(slug);
  if (!tool) notFound();

  const fav = favicon(tool.url);
  const similar = similarTools(tool, 6);
  const facts: { label: string; value: string }[] = [
    { label: "Category", value: tool.category },
    { label: "Type", value: kindLabel(tool.kind) },
    ...(tool.platform ? [{ label: "Platform", value: tool.platform }] : []),
    ...(tool.by ? [{ label: "Source", value: tool.by === "official" ? "Official" : "Community" }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description ?? tool.valueLine,
    applicationCategory: tool.category,
    url: tool.url,
    image: ogImage(tool.url),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${APP_URL}/tools/${tool.slug}` },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: TEXT.muted, margin: "0 0 18px" }}>
        <Link href="/radar/browse" style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: TEXT.muted, textDecoration: "none", fontFamily: SG, fontWeight: 600 }}>
          <ArrowLeft size={14} strokeWidth={2.3} /> Radar
        </Link>
        <span aria-hidden>/</span>
        <span style={{ fontFamily: SG }}>{tool.category}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
        <span style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "13px", background: "#faf9f7", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {fav && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fav} alt="" width={32} height={32} style={{ objectFit: "contain" }} />
          )}
        </span>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h1 style={{ fontFamily: SG, fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>{tool.name}</h1>
          <p style={{ fontSize: "14px", color: TEXT.muted, margin: "6px 0 0", fontFamily: SG }}>{tool.category} · {kindLabel(tool.kind)}</p>
        </div>
        <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#fff", background: GOLD, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
          Visit Website <ArrowUpRight size={16} strokeWidth={2.4} />
        </a>
      </div>

      {/* Cover */}
      <div style={{ margin: "24px 0 0" }}>
        <CoverImage src={ogImage(tool.url)} height={340} radius={16} />
      </div>

      {/* About */}
      <section style={{ margin: "30px 0 0" }}>
        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: 0 }}>About {tool.name}</h2>
        <p style={{ fontSize: "16.5px", color: "#d4d0c9", lineHeight: 1.7, margin: "12px 0 0" }}>{tool.description ?? tool.valueLine}</p>
        {tool.description && (
          <p style={{ fontSize: "15px", color: TEXT.muted, lineHeight: 1.6, margin: "12px 0 0" }}>{tool.valueLine}</p>
        )}
      </section>

      {/* Key facts */}
      <section style={{ margin: "26px 0 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
        {facts.map((f) => (
          <div key={f.label} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "12px 14px" }}>
            <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted }}>{f.label}</span>
            <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: TEXT.primary, marginTop: "4px", fontFamily: SG }}>{f.value}</span>
          </div>
        ))}
        <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "12px 14px", textDecoration: "none" }}>
          <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted }}>Website</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 600, color: GOLD, marginTop: "4px", fontFamily: SG, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hostOf(tool.url)} <ArrowUpRight size={13} strokeWidth={2.4} /></span>
        </a>
      </section>

      {/* MCP install — this is the in-app landing page for curated MCP servers
          (McpMarketClient routes taps to /tools/[slug]), so it belongs here too. */}
      {tool.kind === "mcp" && (
        <McpInstallBlock name={tool.name} install={getMcpInstall(tool.url)} docsUrl={tool.url} />
      )}

      {getAllTools().filter((t) => t.slug !== tool.slug && t.category === tool.category).length >= 3 && (
        <section style={{ margin: "30px 0 0" }}>
          <Link
            href={`/tools/${tool.slug}/alternatives`}
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG,
              fontSize: "14px", fontWeight: 600, color: GOLD,
              border: `1px solid ${HAIRLINE}`, borderRadius: "12px",
              padding: "11px 18px", textDecoration: "none",
            }}
          >
            See {tool.name} alternatives
          </Link>
        </section>
      )}

      {/* Similar tools */}
      {similar.length > 0 && (
        <section style={{ margin: "40px 0 0" }}>
          <h2 style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT.muted, margin: "0 0 14px" }}>Similar tools</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
            {similar.map((s) => {
              const sf = favicon(s.url);
              return (
                <Link key={s.slug} href={`/tools/${s.slug}`} style={{ display: "flex", gap: "11px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "13px 14px", textDecoration: "none" }}>
                  <span style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "9px", background: "#faf9f7", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {sf && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sf} alt="" width={22} height={22} style={{ objectFit: "contain" }} loading="lazy" />
                    )}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px" }}>{s.valueLine}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Back to Radar */}
      <div style={{ margin: "40px 0 0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "16px", padding: "20px 22px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h3 style={{ fontFamily: SG, fontSize: "16px", fontWeight: 700, color: TEXT.primary, margin: 0 }}>Find more on the Radar</h3>
          <p style={{ fontSize: "14px", color: TEXT.muted, margin: "5px 0 0", lineHeight: 1.5 }}>Browse every tool, model, and MCP server in one place.</p>
        </div>
        <Link href="/radar/browse" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#fff", background: GOLD, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
          Open the Radar <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </article>
  );
}
