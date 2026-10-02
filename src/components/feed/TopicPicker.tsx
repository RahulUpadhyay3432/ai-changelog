"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import { CATEGORIES } from "@/lib/categories";
import { setFeedPrefs, setTopicPickerDone } from "@/lib/storage";

// ─── First-session topic picker ──────────────────────────────────────────────
//
// Replaces a toast that said "Pick the topics you care about in Profile" and sent
// the user away to do it. Two problems with that: it covered the lead image, and
// it delegated the one action most correlated with coming back.
//
// docs/analytics-findings-aug-2026.md: changing a category in the first session
// goes with a 24.5% return rate against a 9.5% baseline, on the largest sample of
// any strong signal (n=98). It also found that only 98 of 1,093 people ever did
// it. The behaviour that predicts retention is one almost nobody discovers, which
// is a design problem rather than a demand problem. So the choice happens here,
// in the feed, in one tap, and the feed re-resolves underneath.
//
// Docked to the bottom of the phone column (absolute, never fixed) so the story
// above stays readable while choosing.

export function TopicPicker({ onDone }: { onDone: (slugs: string[] | null) => void }) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (slug: string) =>
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const confirm = () => {
    setFeedPrefs(selected);
    setTopicPickerDone();
    // Keep emitting the established event so the existing retention analysis
    // keeps working, with a source so onboarding is separable from Profile.
    posthog.capture("feed_prefs_changed", { count: selected.length, slugs: selected, source: "onboarding" });
    posthog.capture("topic_picker_completed", { count: selected.length });
    onDone(selected);
  };

  const skip = () => {
    setTopicPickerDone();
    posthog.capture("topic_picker_skipped");
    onDone(null);
  };

  return (
    <motion.div
      initial={reduce ? false : { y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        padding: "20px 20px 22px",
        background: "var(--kt-surface-raised, rgba(14,13,12,0.98))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--kt-hairline, rgba(255,255,255,0.1))",
        borderTopLeftRadius: "22px",
        borderTopRightRadius: "22px",
        boxShadow: "0 -14px 40px rgba(0,0,0,0.55)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "19px",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--kt-text-primary, #f5f5f5)",
          margin: "0 0 5px",
        }}
      >
        What do you build with AI?
      </h2>
      <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "var(--kt-text-muted, #8a857c)", margin: "0 0 15px" }}>
        Pick the topics you care about and today&apos;s brief is tuned to them. You can change this any time.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
        {CATEGORIES.map((c) => {
          const on = selected.includes(c.slug);
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.slug)}
              style={{
                // 44px min touch target
                minHeight: "44px",
                padding: "10px 15px",
                borderRadius: "100px",
                cursor: "pointer",
                fontSize: "13.5px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                background: on ? c.colorBg : "var(--kt-surface, rgba(255,255,255,0.04))",
                border: `1px solid ${on ? c.colorAccent : "var(--kt-hairline, rgba(255,255,255,0.1))"}`,
                color: on ? c.colorLabel : "var(--kt-text-body, #c9c4bc)",
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={confirm}
          disabled={selected.length === 0}
          style={{
            flex: 1,
            minHeight: "46px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            borderRadius: "13px",
            border: "none",
            cursor: selected.length === 0 ? "default" : "pointer",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "14.5px",
            fontWeight: 600,
            color: selected.length === 0 ? "var(--kt-text-muted, #6b665f)" : "#ffffff",
            background: selected.length === 0 ? "rgba(255,255,255,0.06)" : "var(--kt-accent, #3b82f6)",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {selected.length === 0
            ? "Pick at least one"
            : `Tune my feed (${selected.length})`}
          {selected.length > 0 && <ArrowRight size={16} strokeWidth={2.4} />}
        </button>
        <button
          type="button"
          onClick={skip}
          style={{
            minHeight: "46px",
            padding: "0 14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--kt-text-muted, #8a857c)",
          }}
        >
          Show me everything
        </button>
      </div>
    </motion.div>
  );
}
