import React from "react";
import Link from "next/link";
import { ArrowUpRight, Info, Lightbulb, AlertTriangle } from "lucide-react";
import { MermaidDiagram } from "@/components/blog/MermaidDiagram";
import { slugify, type BlogBlock, type BlogTool } from "@/lib/blog-content";
import { HAIRLINE, SG } from "@/lib/design-tokens";
import styles from "../../app/(web)/blog/blog.module.css";

// ─── Inline formatter ────────────────────────────────────────────────────────
// Lightweight markup inside `text` fields: **bold**, [label](url), `code`.
// No markdown dependency — a single tokenizer covers the three forms we use.
const INLINE_RE = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;

const inlineCodeStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, "Geist Mono", "SF Mono", Menlo, monospace',
  fontSize: "0.875em",
  background: "rgba(255,255,255,0.07)",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "5px",
  padding: "1px 5px",
  color: "#efebe2",
};
const linkStyle: React.CSSProperties = {
  color: "var(--accent, #5b9bff)",
  textDecoration: "underline",
  textUnderlineOffset: "2px",
  textDecorationColor: "rgba(91,155,255,0.45)",
};

export function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={key++} style={{ color: "var(--heading, #fbfaf7)", fontWeight: 600 }}>
          {m[2]}
        </strong>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <code key={key++} style={inlineCodeStyle}>
          {m[3]}
        </code>
      );
    } else if (m[4] !== undefined) {
      const href = m[5];
      const internal = href.startsWith("/");
      nodes.push(
        internal ? (
          <Link key={key++} href={href} style={linkStyle}>
            {m[4]}
          </Link>
        ) : (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            {m[4]}
          </a>
        )
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ─── Tool card (shared look with the blog index) ─────────────────────────────
function faviconFor(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `/api/favicon?domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}

function ToolCard({ tool }: { tool: BlogTool }) {
  const fav = faviconFor(tool.url);
  let host = tool.url;
  try {
    host = new URL(tool.url).hostname.replace(/^www\./, "");
  } catch {}
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "flex", gap: "12px", textDecoration: "none", background: "rgba(255,255,255,0.025)", border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "14px 15px" }}
    >
      <span style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "9px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {fav ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fav} alt="" width={24} height={24} loading="lazy" style={{ display: "block" }} />
        ) : null}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#f5f5f5" }}>
          {tool.name}
          <ArrowUpRight size={13} strokeWidth={2.2} color="#737373" style={{ flexShrink: 0 }} />
        </span>
        <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", lineHeight: 1.45, margin: "3px 0 2px" }}>{tool.valueLine}</span>
        <span style={{ fontSize: "12px", color: "#5c6470", fontFamily: SG }}>{host}</span>
      </span>
    </a>
  );
}

// ─── Callout variants ────────────────────────────────────────────────────────
const CALLOUT = {
  note: { color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", Icon: Info },
  tip: { color: "#4ade80", bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.22)", Icon: Lightbulb },
  warning: { color: "#fbbf24", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.25)", Icon: AlertTriangle },
} as const;

// ─── Block renderer ──────────────────────────────────────────────────────────
function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className={block.lead ? styles.lead : styles.para}>
          {renderInline(block.text)}
        </p>
      );

    case "heading": {
      const id = slugify(block.text);
      if (block.level === 3) {
        return (
          <h3 id={id} className={styles.h3}>
            {block.text}
          </h3>
        );
      }
      return (
        <h2 id={id} className={styles.h2}>
          {block.text}
        </h2>
      );
    }

    case "list":
      return block.ordered ? (
        <ol className={styles.olist}>
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ol>
      ) : (
        <ul className={styles.ulist}>
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p>{renderInline(block.text)}</p>
          {block.cite && <cite className={styles.cite}>— {block.cite}</cite>}
        </blockquote>
      );

    case "callout": {
      const c = CALLOUT[block.variant];
      const Icon = c.Icon;
      return (
        <div className={styles.callout} style={{ background: c.bg, borderColor: c.border }}>
          <span className={styles.calloutIcon} style={{ color: c.color }}>
            <Icon size={18} strokeWidth={2.2} />
          </span>
          <div>
            {block.title && (
              <p className={styles.calloutTitle} style={{ color: c.color }}>
                {block.title}
              </p>
            )}
            <p className={styles.calloutText}>{renderInline(block.text)}</p>
          </div>
        </div>
      );
    }

    case "code":
      return (
        <div className={styles.codeWrap}>
          {block.lang && <span className={styles.codeLang}>{block.lang}</span>}
          <pre className={styles.code}>
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case "tools":
      return (
        <div>
          {block.title && <p className={styles.toolsTitle}>{block.title}</p>}
          <div className={styles.toolGrid}>
            {block.items.map((t) => (
              <ToolCard key={t.name} tool={t} />
            ))}
          </div>
        </div>
      );

    case "diagram":
      return (
        <figure className={styles.figure}>
          <MermaidDiagram chart={block.chart} />
          {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
        </figure>
      );

    case "figure":
      return (
        <figure className={styles.figure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt} loading="lazy" className={styles.figureImg} />
          {(block.caption || block.credit) && (
            <figcaption className={styles.caption}>
              {block.caption}
              {block.credit && <span className={styles.credit}> · {block.credit}</span>}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return <hr className={styles.divider} />;

    default:
      return null;
  }
}

export function BlogBody({ body }: { body: BlogBlock[] }) {
  return (
    <div className={styles.article}>
      {body.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
