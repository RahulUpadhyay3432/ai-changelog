"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Rotating typewriter: types a word → holds → deletes → advances → loops.
// SSR-safe: first paint renders the full first word (real text for SEO + no
// hydration mismatch); the cycle starts in useEffect after startDelayMs so it
// begins once the surrounding hero entrance has played. Reduced motion → the
// first word stays put with a steady cursor (no typing).
type Phase = "typing" | "holding" | "deleting";

export function Typewriter({
  words,
  color,
  typeMs = 65,
  deleteMs = 34,
  holdMs = 1400,
  startDelayMs = 450,
  style,
}: {
  words: string[];
  color?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  startDelayMs?: number;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const first = words[0] ?? "";
  const [text, setText] = useState(first);
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("holding");
  const [started, setStarted] = useState(false);

  // Kick the cycle off after the hero entrance (skipped under reduced motion).
  useEffect(() => {
    if (reduce || words.length < 2) return;
    const t = setTimeout(() => {
      setStarted(true);
      setPhase("deleting");
    }, startDelayMs);
    return () => clearTimeout(t);
  }, [reduce, words.length, startDelayMs]);

  useEffect(() => {
    if (!started) return;
    const current = words[wordIdx] ?? "";

    if (phase === "typing") {
      if (text === current) {
        const t = setTimeout(() => setPhase("holding"), holdMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("deleting"), holdMs);
      return () => clearTimeout(t);
    }

    // deleting
    if (text === "") {
      setWordIdx((i) => (i + 1) % words.length);
      setPhase("typing");
      return;
    }
    const t = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteMs);
    return () => clearTimeout(t);
  }, [started, phase, text, wordIdx, words, typeMs, deleteMs, holdMs]);

  return (
    <span style={{ color, whiteSpace: "nowrap", ...style }}>
      {text}
      <motion.span
        aria-hidden
        initial={{ opacity: 1 }}
        animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
        transition={reduce ? undefined : { duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
        style={{
          display: "inline-block",
          width: "0.06em",
          height: "0.92em",
          marginLeft: "0.06em",
          background: color ?? "currentColor",
          transform: "translateY(0.1em)",
          borderRadius: "1px",
        }}
      />
    </span>
  );
}
