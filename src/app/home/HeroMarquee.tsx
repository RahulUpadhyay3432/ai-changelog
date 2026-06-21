"use client";

import Link from "next/link";
import { TEXT, SURFACE, HAIRLINE, SG } from "@/lib/design-tokens";
import styles from "./landing.module.css";

export interface MarqueeItem {
  name: string;
  typeLabel: string;            // "tool" | "MCP" | "skill" | "OSS"
  faviconHref: string | null;   // /api/favicon?... or null → no mark
  href: string;
}

function Chip({ item }: { item: MarqueeItem }) {
  return (
    <Link
      href={item.href}
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        background: SURFACE,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: "12px",
        padding: "9px 13px",
        textDecoration: "none",
      }}
    >
      {item.faviconHref ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.faviconHref}
          alt=""
          width={18}
          height={18}
          loading="lazy"
          style={{ width: "18px", height: "18px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : null}
      <span style={{ fontFamily: SG, fontSize: "13.5px", fontWeight: 600, color: TEXT.primary, whiteSpace: "nowrap" }}>
        {item.name}
      </span>
      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: TEXT.muted }}>
        {item.typeLabel}
      </span>
    </Link>
  );
}

// Two rows of slowly auto-scrolling catalog chips (the live "wall" that shows
// breadth). The track is duplicated so the CSS translateX(-50%) loops seamlessly;
// pause-on-hover + reduced-motion handled in landing.module.css.
export function HeroMarquee({ items }: { items: MarqueeItem[] }) {
  if (items.length === 0) return null;
  const mid = Math.ceil(items.length / 2);
  const rowA = items.slice(0, mid);
  const rowB = items.slice(mid);

  return (
    <div className={styles.heroVisual} aria-hidden>
      <div className={styles.marqueeViewport} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className={styles.marqueeRow}>
          {[...rowA, ...rowA].map((it, i) => <Chip key={`a${i}`} item={it} />)}
        </div>
        <div className={`${styles.marqueeRow} ${styles.marqueeRowReverse}`}>
          {[...rowB, ...rowB].map((it, i) => <Chip key={`b${i}`} item={it} />)}
        </div>
      </div>
    </div>
  );
}
