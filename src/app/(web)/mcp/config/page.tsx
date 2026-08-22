import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MCP_CLIENTS, MCP_FAILURES } from "@/lib/mcp-clients";
import { GOLD, HAIRLINE, SG, SURFACE, TEXT } from "@/lib/design-tokens";
import { serializeJsonLd } from "@/lib/json-ld";

const APP_URL = "https://kapyn.app";
export const revalidate = 86400;

const DESC =
  "Where the MCP config file lives for Claude Code, Claude Desktop, Cursor, VS Code and Windsurf, with the exact paths, the root key each one expects, and fixes for why a server isn't showing up.";

export const metadata: Metadata = {
  title: "MCP config file location, every client, exact paths",
  description: DESC,
  alternates: { canonical: `${APP_URL}/mcp/config` },
  openGraph: {
    title: "MCP config file location, every client, exact paths",
    description: DESC,
    url: `${APP_URL}/mcp/config`,
    siteName: "Kapyn",
    type: "article",
  },
};

// Simple inline renderer for the **bold** spans in the source data — the notes
// are hand-written prose, not a general markdown surface.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ color: TEXT.primary, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.92em", color: "#cbc7bf" }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function McpConfigPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ...MCP_CLIENTS.map((c) => ({
        "@type": "Question",
        name: `Where is the MCP config file for ${c.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${c.paths.map((p) => `${p.os}: ${p.path}`).join(". ")}. Servers go under the "${c.rootKey}" key.`,
        },
      })),
      ...MCP_FAILURES.map((f) => ({
        "@type": "Question",
        name: f.symptom,
        acceptedAnswer: { "@type": "Answer", text: `${f.cause}. ${f.fix}` },
      })),
    ],
  };

  const h2 = { fontFamily: SG, fontSize: "21px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: "0 0 14px" } as const;
  const mono = { fontFamily: "var(--font-geist-mono), monospace", fontSize: "12.5px", color: "#cbc7bf", userSelect: "all" as const, wordBreak: "break-all" as const };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />

      <Link href="/mcp" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.muted, textDecoration: "none", margin: "0 0 18px" }}>
        <ArrowLeft size={14} strokeWidth={2.3} /> MCP servers
      </Link>

      <span style={{ display: "block", fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD }}>Reference</span>
      <h1 style={{ fontFamily: SG, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "12px 0 0" }}>
        Where the MCP config file lives
      </h1>
      <p style={{ fontSize: "17px", color: "#d5d2cb", lineHeight: 1.65, margin: "16px 0 0", maxWidth: "620px" }}>
        Every client keeps it somewhere different, and two of them will silently do nothing if you
        get it slightly wrong. Exact paths below, verified against vendor documentation in August 2026.
      </p>

      <section style={{ margin: "34px 0 0" }}>
        <h2 style={h2}>By client</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {MCP_CLIENTS.map((c) => (
            <div key={c.id} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "17px 19px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: TEXT.primary }}>{c.name}</span>
                <span style={{ fontSize: "12px", color: TEXT.muted }}>
                  root key <code style={{ ...mono, fontSize: "12px", color: c.rootKey === "servers" ? "#f0b429" : "#cbc7bf" }}>{c.rootKey}</code>
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", margin: "12px 0 0" }}>
                <tbody>
                  {c.paths.map((p) => (
                    <tr key={p.path}>
                      <td style={{ fontSize: "12px", color: TEXT.muted, padding: "4px 12px 4px 0", whiteSpace: "nowrap", verticalAlign: "top" }}>{p.os}</td>
                      <td style={{ ...mono, padding: "4px 0" }}>{p.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul style={{ margin: "12px 0 0", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "7px" }}>
                {c.notes.map((n, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#a3a3a3", lineHeight: 1.6 }}>
                    <Rich text={n} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ margin: "40px 0 0" }}>
        <h2 style={h2}>Why your server isn&apos;t showing up</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {MCP_FAILURES.map((f) => (
            <div key={f.symptom} style={{ border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "15px 17px" }}>
              <p style={{ fontFamily: SG, fontSize: "15px", fontWeight: 600, color: TEXT.primary, margin: 0 }}>{f.symptom}</p>
              <p style={{ fontSize: "13px", color: GOLD, margin: "4px 0 0" }}>{f.cause}</p>
              <p style={{ fontSize: "14.5px", color: "#a3a3a3", lineHeight: 1.65, margin: "8px 0 0" }}>
                <Rich text={f.fix} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ margin: "36px 0 0", paddingTop: "26px", borderTop: `1px solid ${HAIRLINE}` }}>
        <p style={{ fontSize: "14.5px", color: TEXT.muted, lineHeight: 1.7, maxWidth: "620px" }}>
          Once it connects, the question becomes which servers are worth the context they cost, three to five is the working recommendation, not thirty. We keep a{" "}
          <Link href="/mcp" style={{ color: GOLD, textDecoration: "none" }}>hand-checked directory</Link>{" "}
          with copy-paste configs, and argued the case for a{" "}
          <Link href="/blog/best-mcp-servers-2026" style={{ color: GOLD, textDecoration: "none" }}>deliberately short list</Link>.
        </p>
      </section>
    </article>
  );
}
