import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MCP_SERVERS, MCP_CATEGORY_EMOJI, githubFullName, type McpServer } from "@/lib/radar-mcp";
import { slugify } from "@/lib/entities";
import { getMcpInstall, claudeCodeCommand } from "@/lib/mcp-install";
import { lookupRegistryStatus } from "@/lib/mcp-registry";
import { McpInstallBlock } from "@/components/mcp/McpInstallBlock";
import { GOLD, HAIRLINE, SG } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MCP_SERVERS.map((s) => ({ slug: slugify(s.name) }));
}

function getServer(slug: string): McpServer | undefined {
  return MCP_SERVERS.find((s) => slugify(s.name) === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getServer(slug);
  if (!s) return { title: "MCP server not found", robots: { index: false, follow: true } };
  const url = `${APP_URL}/mcp/${slug}`;
  const title = `${s.name} MCP server, what it is & how to use it`;
  return {
    title,
    description: s.tagline,
    alternates: { canonical: url },
    openGraph: { title, description: s.description, url, siteName: "Kapyn", type: "article" },
    twitter: { card: "summary", title, description: s.tagline },
  };
}

export default async function McpDetail({ params }: Props) {
  const { slug } = await params;
  const s = getServer(slug);
  if (!s) notFound();

  const repo = githubFullName(s.url);
  const install = getMcpInstall(s.url);
  // Official-registry check, revalidated daily with the page. Absence is normal
  // and renders as "not listed" — plenty of good servers were never published
  // there, so it must never read as a warning.
  const registry = await lookupRegistryStatus(s.url);
  const related = MCP_SERVERS.filter((x) => x.category === s.category && x.name !== s.name).slice(0, 6);
  const url = `${APP_URL}/mcp/${slug}`;
  const answer = `${s.tagline} ${s.description}`;

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${s.name} MCP server`,
    description: s.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: s.url,
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is the ${s.name} MCP server?`, acceptedAnswer: { "@type": "Answer", text: answer } },
      ...(install
        ? [{
            "@type": "Question",
            name: `How do I install the ${s.name} MCP server?`,
            acceptedAnswer: { "@type": "Answer", text: `Run: ${claudeCodeCommand(s.name, install)}` },
          }]
        : []),
      { "@type": "Question", name: `Is the ${s.name} MCP server official?`, acceptedAnswer: { "@type": "Answer", text: s.by === "official" ? `Yes , ${s.name} is an official MCP server.` : `${s.name} is a community-built MCP server.` } },
    ],
  };
  const howToLd = install
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to install the ${s.name} MCP server`,
        description: `Add ${s.name} to Claude Code, Claude Desktop, Cursor or VS Code.`,
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Add the server",
            text: claudeCodeCommand(s.name, install),
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Restart your client",
            text: `Restart the client so it picks up ${s.name}, then confirm the tools are listed.`,
          },
        ],
      }
    : null;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MCP servers", item: `${APP_URL}/mcp` },
      { "@type": "ListItem", position: 2, name: s.name, item: url },
    ],
  };

  const factLabel = { fontSize: "12px", color: "#737373", fontWeight: 500 };
  const factValue = { fontSize: "13.5px", color: "#cbc7bf", fontWeight: 500 };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }} />
      {howToLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToLd) }} />}

      <Link href="/mcp" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: "#a3a3a3", textDecoration: "none", margin: "0 0 18px" }}>
        <ArrowLeft size={14} strokeWidth={2.3} /> MCP servers
      </Link>

      <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD }}>
        <span aria-hidden>{MCP_CATEGORY_EMOJI[s.category]}</span>{s.category} · MCP server
      </span>
      <h1 style={{ fontFamily: SG, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f6f4f0", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "12px 0 0" }}>
        {s.name} MCP server
      </h1>

      {/* 40-word extractable answer */}
      <p style={{ fontSize: "17px", color: "#d5d2cb", lineHeight: 1.65, margin: "16px 0 0", maxWidth: "600px" }}>{answer}</p>

      {/* At-a-glance facts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", margin: "22px 0 0", padding: "16px 20px", border: `1px solid ${HAIRLINE}`, borderRadius: "14px", background: "rgba(255,255,255,0.025)" }}>
        <span><span style={factLabel}>Category</span><br /><span style={factValue}>{s.category}</span></span>
        <span><span style={factLabel}>Maintained by</span><br /><span style={factValue}>{s.by === "official" ? "Official" : "Community"}</span></span>
        <span><span style={factLabel}>Protocol</span><br /><span style={factValue}>Model Context Protocol</span></span>
        {repo && <span><span style={factLabel}>Source</span><br /><span style={factValue}>{repo}</span></span>}
      </div>

      {/* Primary action */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "20px 0 0" }}>
        <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: "#f5f5f5", borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
          <ArrowUpRight size={16} strokeWidth={2.2} /> {repo ? "View on GitHub" : "Open site"}
        </a>
        <Link href="/radar/mcp" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#cbc7bf", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
          Browse all MCP servers
        </Link>
      </div>

      {registry && (
        <div
          style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px",
            margin: "20px 0 0", padding: "12px 16px",
            border: `1px solid ${registry.status === "active" ? "rgba(37,99,235,0.28)" : "rgba(217,119,6,0.32)"}`,
            background: registry.status === "active" ? "rgba(37,99,235,0.07)" : "rgba(217,119,6,0.07)",
            borderRadius: "12px",
          }}
        >
          <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 600, color: registry.status === "active" ? "#93b4fd" : "#e0b877" }}>
            {registry.status === "active" ? "In the official MCP registry" : `Registry status: ${registry.status}`}
          </span>
          <span style={{ fontSize: "12.5px", color: "#8a857c" }}>{registry.registryName}</span>
          {!registry.isLatest && (
            <span style={{ fontSize: "12.5px", color: "#e0b877" }}>a newer version is published</span>
          )}
          {registry.updatedAt && (
            <span style={{ fontSize: "12.5px", color: "#737373" }}>
              updated {registry.updatedAt.slice(0, 10)}
            </span>
          )}
        </div>
      )}

      <McpInstallBlock name={s.name} install={install} docsUrl={s.url} />

      {/* What it does */}
      <section style={{ margin: "34px 0 0" }}>
        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", margin: 0 }}>What it does</h2>
        <p style={{ fontSize: "16px", color: "#cbc7bf", lineHeight: 1.7, margin: "12px 0 0" }}>{s.description}</p>
        <p style={{ fontSize: "16px", color: "#cbc7bf", lineHeight: 1.7, margin: "14px 0 0" }}>
          Like any MCP server, {s.name} plugs into MCP-compatible assistants (such as Claude and other clients) so the model can use it as a tool , no custom integration code required.
        </p>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ margin: "34px 0 0" }}>
          <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", margin: "0 0 14px" }}>Related {s.category} MCP servers</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {related.map((r) => (
              <li key={r.name}>
                <Link href={`/mcp/${slugify(r.name)}`} style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "13px 15px" }}>
                  <span style={{ fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#f5f5f5" }}>{r.name}</span>
                  <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", lineHeight: 1.4, marginTop: "3px" }}>{r.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
