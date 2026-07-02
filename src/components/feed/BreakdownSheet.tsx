"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/categories";
import { fetchBreakdown as loadBreakdown, getCachedBreakdown } from "@/lib/breakdown-cache";

interface BreakdownSheetProps {
  item: NewsItem;
  open: boolean;
  onClose: () => void;
}

// Curated AI/tech facts shown while the breakdown generates.
// Verified, calm voice — no hype, no emojis, no exclamation marks.
const TECH_FACTS = [
  "The transformer architecture behind most modern AI was introduced in a 2017 paper titled 'Attention Is All You Need' by eight Google researchers.",
  "AlphaFold solved a 50-year-old problem in biology by predicting the 3D structure of nearly every known protein — in under a year.",
  "GPT-2 was initially withheld from release in 2019 over fears of misuse. It was published in full six months later.",
  "The word 'robot' was coined in 1920 by Czech playwright Karel Capek — from the Czech word for forced labor.",
  "The first neural network capable of recognizing handwritten digits was built by Yann LeCun at Bell Labs in 1989.",
  "Linux, which runs most of the world's servers and every Android device, started as a personal hobby project by a 21-year-old student.",
  "The term 'artificial intelligence' was coined at a 1956 Dartmouth workshop. Its organizer predicted machines would match human intelligence within a generation.",
  "DeepMind's AlphaGo made Move 37 in Game 2 against Lee Sedol — so unexpected that human commentators initially thought it was a mistake.",
  "The first Git commit was written by Linus Torvalds in 10 days in 2005, after a licensing dispute with the tool previously used for Linux.",
  "Moore's Law — transistor counts doubling roughly every two years — has held since 1965 and is only now beginning to slow.",
  "NVIDIA's H100 chip contains 80 billion transistors and can sustain 4 petaflops of AI computation.",
  "The first commercial spam email was sent in 1978 over ARPANET — a marketing message to 393 recipients from a DEC salesperson.",
  "Redis, one of the most widely used in-memory databases, was built in a weekend by a single developer while working on a startup analytics tool.",
  "OpenAI launched as a nonprofit in 2015 with $1 billion in pledged funding, then restructured as a capped-profit company to raise further capital.",
  "Mistral AI's seed round of $113 million was, at the time, the largest seed raise in European startup history.",
  "A single large language model inference request uses roughly 10–50 times more energy than a standard web search query.",
  "The attention mechanism in transformers was inspired by research into how human visual cortex focuses selectively rather than processing everything at once.",
  "Claude Shannon, the father of information theory, once rode a unicycle through the halls of Bell Labs while juggling.",
  "Sora generates video by learning to reverse a noise process — the same diffusion principle used in image models, applied to sequences of visual patches.",
  "The training compute for GPT-4 is estimated at around 2×10²⁵ floating-point operations — roughly 10,000 times more than GPT-3.",
];

function SheetContent({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  // If prefetched while scrolling, it's already cached → show instantly, no skeleton.
  const cached = getCachedBreakdown(item.id);
  const [explanation, setExplanation] = useState<string | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);
  const category = getCategoryBySlug(item.categorySlug as never);

  const fetchBreakdown = useCallback(async () => {
    const hit = getCachedBreakdown(item.id);
    if (hit) {
      setExplanation(hit);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    setExplanation(null);
    const result = await loadBreakdown(item);
    if (result) {
      setExplanation(result);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [item]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  // Rotate through tech facts every few seconds while the breakdown loads.
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * TECH_FACTS.length)
  );
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setFactIndex((i) => (i + 1) % TECH_FACTS.length), 4000);
    return () => clearInterval(t);
  }, [loading]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          pointerEvents: "all",
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80) onClose();
        }}
        style={{
          position: "relative",
          background: "#111111",
          borderRadius: "20px 20px 0 0",
          padding: "0 0 calc(env(safe-area-inset-bottom, 0px) + 32px)",
          pointerEvents: "all",
          maxHeight: "80dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.15)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "8px 20px 12px",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, paddingRight: "12px" }}>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: category?.colorLabel ?? "#a3a3a3",
                background: category
                  ? `${category.colorAccent}12`
                  : "rgba(255,255,255,0.04)",
                border: category
                  ? `1px solid ${category.colorAccent}20`
                  : "1px solid rgba(255,255,255,0.07)",
                padding: "2px 8px",
                borderRadius: "100px",
                display: "inline-block",
                marginBottom: "8px",
              }}
            >
              {category?.name ?? item.categorySlug}
            </span>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#E8E4DE",
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {item.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            <X size={16} color="#8f8a82" strokeWidth={2} />
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div
          style={{
            padding: "20px 20px 0",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Skeleton lines */}
              {[90, 75, 85, 60].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: "14px",
                    borderRadius: "7px",
                    background: "rgba(255,255,255,0.07)",
                    width: `${w}%`,
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.4; }
                  50% { opacity: 1; }
                }
                @keyframes factIn {
                  from { opacity: 0; transform: translateY(6px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                <span className="kt-loader" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
                <p style={{ fontSize: "12px", color: "#8f8a82", margin: 0 }}>
                  This can take a few seconds.
                </p>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#9a948b",
                    margin: "0 0 6px",
                  }}
                >
                  Did you know
                </p>
                <p
                  key={factIndex}
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.55,
                    color: "#a29d94",
                    margin: 0,
                    animation: "factIn 0.5s ease",
                  }}
                >
                  {TECH_FACTS[factIndex]}
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: "#8f8a82", fontSize: "14px", marginBottom: "16px" }}>
                Couldn&apos;t load explanation
              </p>
              <button
                onClick={fetchBreakdown}
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  background: category?.colorAccent ?? "#6366f1",
                  border: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          )}

          {explanation && !loading && (
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#C8C4BE",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {explanation.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i} style={{ color: "#E8E4DE", fontWeight: 600 }}>
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function BreakdownSheet({ item, open, onClose }: BreakdownSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const container = document.getElementById("phone-overlay-root") ?? document.body;
  return createPortal(
    <AnimatePresence>{open && <SheetContent item={item} onClose={onClose} />}</AnimatePresence>,
    container
  );
}
