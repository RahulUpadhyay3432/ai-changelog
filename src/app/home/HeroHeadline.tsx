"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GOLD, TEXT, SG } from "@/lib/design-tokens";

type Word = { text: string; accent?: boolean; br?: boolean };

const WORDS: Word[] = [
  { text: "Find" },
  { text: "the" },
  { text: "AI", br: true },
  { text: "worth" },
  { text: "using.", accent: true },
];

const EASE: [number, number, number, number] = [0.2, 0, 0, 1];

const H1_STYLE: React.CSSProperties = {
  fontFamily: SG,
  fontSize: "clamp(40px, 6vw, 64px)",
  fontWeight: 700,
  color: TEXT.primary,
  letterSpacing: "-0.04em",
  lineHeight: 1.02,
  margin: "18px 0 0",
};

export function HeroHeadline() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <h1 style={H1_STYLE}>
        Find the AI<br />worth <span style={{ color: GOLD }}>using.</span>
      </h1>
    );
  }

  const nodes: React.ReactNode[] = [];
  WORDS.forEach((w, i) => {
    nodes.push(
      <motion.span
        key={w.text}
        initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 + i * 0.09, ease: EASE }}
        style={{ display: "inline-block", color: w.accent ? GOLD : "inherit" }}
      >
        {w.text}
      </motion.span>
    );
    if (w.br) nodes.push(<br key={`br-${i}`} />);
    else if (i < WORDS.length - 1) nodes.push(" ");
  });

  return <h1 style={H1_STYLE}>{nodes}</h1>;
}
