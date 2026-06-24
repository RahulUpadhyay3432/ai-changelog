"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { HAIRLINE, SG, TEXT } from "@/lib/design-tokens";

// Minimal share affordances under the byline: X, LinkedIn, copy-link.
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const enc = encodeURIComponent;
  const xUrl = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: SG,
    fontSize: "12.5px",
    fontWeight: 600,
    color: TEXT.muted,
    background: "transparent",
    border: `1px solid ${HAIRLINE}`,
    borderRadius: "100px",
    padding: "6px 12px",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12px", color: TEXT.muted, fontFamily: SG, marginRight: "2px" }}>Share</span>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" style={btn} aria-label="Share on X">
        X
      </a>
      <a href={liUrl} target="_blank" rel="noopener noreferrer" style={btn} aria-label="Share on LinkedIn">
        LinkedIn
      </a>
      <button onClick={copy} style={btn} aria-label="Copy link">
        {copied ? <Check size={13} strokeWidth={2.4} color="#4ade80" /> : <Link2 size={13} strokeWidth={2.2} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
