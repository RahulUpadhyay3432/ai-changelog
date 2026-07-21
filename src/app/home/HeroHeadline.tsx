"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GOLD, TEXT, SG } from "@/lib/design-tokens";

// Stable hero headline — commits to Kapyn's core promise from first paint (no
// rotating word). "worth using" carries the accent; curation is the whole point.
const LINE1 = ["The", "calm", "map", "of", "the"];
const LINE2: { word: string; accent: boolean }[] = [
  { word: "AI", accent: false },
  { word: "worth", accent: true },
  { word: "using.", accent: true },
];

const EASE: [number, number, number, number] = [0.2, 0, 0, 1];

const H1_STYLE: React.CSSProperties = {
  fontFamily: SG,
  fontSize: "clamp(40px, 6vw, 64px)",
  fontWeight: 700,
  color: TEXT.primary,
  letterSpacing: "-0.04em",
  lineHeight: 1.04,
  margin: "18px 0 0",
};

export function HeroHeadline() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <h1 style={H1_STYLE}>
        The calm map of the
        <br />
        AI <span style={{ color: GOLD }}>worth using.</span>
      </h1>
    );
  }

  const word = (w: string, i: number, accent: boolean) => (
    <motion.span
      key={`${w}-${i}`}
      initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 + i * 0.075, ease: EASE }}
      style={{ display: "inline-block", color: accent ? GOLD : undefined }}
    >
      {w}
    </motion.span>
  );

  return (
    <h1 style={H1_STYLE}>
      {LINE1.map((w, i) => (
        <span key={`l1-${i}`}>{word(w, i, false)} </span>
      ))}
      <br />
      {LINE2.map((w, i) => (
        <span key={`l2-${i}`}>{word(w.word, LINE1.length + i, w.accent)} </span>
      ))}
    </h1>
  );
}
