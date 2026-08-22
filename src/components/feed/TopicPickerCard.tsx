"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import posthog from "posthog-js";
import { setFeedPrefs } from "@/lib/storage";
import { CATEGORY_TABS } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";

// ─── The investment moment ───────────────────────────────────────────────────
// Measured 2026-08-22 across 90 days of PostHog data (docs/analytics-findings-
// aug-2026.md): baseline return rate is 9.5%, but people who did something in
// their FIRST session returned far more often —
//
//   picked a category      24.5%  (n=98)     saved a story        35.8%  (n=53)
//   swiped a story         17.5%             finished the feed    12.9%  (n=535)
//
// Investment predicts return; consumption barely moves it. Yet only 98 of 1,093
// people ever changed a category, because the control lives in Profile where
// first-timers never look. This card puts that one choice in front of them.
//
// Slot 2, not the push-prompt's slot 5: over half of all sessions end on card 0,
// so anything at slot 5 reaches almost nobody.

interface TopicPickerCardProps {
  onDone: () => void;
}

const PICKABLE = CATEGORY_TABS.filter((t) => t.slug !== "all");

export function TopicPickerCard({ onDone }: TopicPickerCardProps) {
  const [selected, setSelected] = useState<CategorySlug[]>([]);

  const toggle = (slug: CategorySlug) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleSave = () => {
    setFeedPrefs(selected);
    // Same event the Profile control fires, so the retention analysis keeps
    // working and we can compare the two entry points.
    posthog.capture("feed_prefs_changed", {
      categories: selected,
      count: selected.length,
      source: "topic_picker_card",
    });
    onDone();
  };

  const handleSkip = () => {
    posthog.capture("topic_picker_skipped");
    onDone();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 28px 48px",
        background: "var(--kt-canvas, #0a0a0a)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          background: "rgba(37,99,235,0.08)",
          border: "1px solid rgba(37,99,235,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <Sparkles size={26} color="#2563eb" strokeWidth={1.5} />
      </div>

      <p
        style={{
          margin: "0 0 10px",
          fontSize: "23px",
          fontWeight: 600,
          color: "var(--kt-text-primary, #E8E4DE)",
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        What do you care about?
      </p>

      <p
        style={{
          margin: "0 0 26px",
          fontSize: "14.5px",
          color: "var(--kt-text-muted, #525252)",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "270px",
        }}
      >
        Pick a few and your feed leads with them. Change it any time.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          maxWidth: "330px",
          marginBottom: "28px",
        }}
      >
        {PICKABLE.map((t) => {
          const on = selected.includes(t.slug);
          return (
            <button
              key={t.slug}
              onClick={() => toggle(t.slug)}
              aria-pressed={on}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                padding: "9px 15px",
                borderRadius: "100px",
                cursor: "pointer",
                transition: "background 140ms ease, border-color 140ms ease",
                background: on ? "rgba(37,99,235,0.16)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${on ? "rgba(37,99,235,0.45)" : "rgba(255,255,255,0.09)"}`,
                color: on ? "#93b4fd" : "var(--kt-text-muted, #a3a3a3)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={selected.length === 0}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          borderRadius: "14px",
          background: selected.length ? "#2563eb" : "rgba(255,255,255,0.06)",
          border: "none",
          color: selected.length ? "#fff" : "var(--kt-text-muted, #525252)",
          fontSize: "15px",
          fontWeight: 600,
          cursor: selected.length ? "pointer" : "default",
          transition: "background 140ms ease",
        }}
      >
        {selected.length ? `Use these ${selected.length}` : "Pick at least one"}
      </button>

      <button
        onClick={handleSkip}
        style={{
          marginTop: "14px",
          background: "none",
          border: "none",
          color: "var(--kt-text-muted, #525252)",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Show me everything
      </button>
    </div>
  );
}
