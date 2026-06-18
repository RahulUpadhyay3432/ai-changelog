"use client";

import { useState } from "react";
import { TrendingUp, Sparkles, Flame } from "lucide-react";
import posthog from "posthog-js";
import type { TrendingStory } from "@/lib/trending";
import { getCategoryBySlug } from "@/lib/categories";
import { formatTimeAgo } from "@/lib/mock-data";
import { BreakdownSheet } from "@/components/feed/BreakdownSheet";
import type { CategorySlug } from "@/lib/types";

interface Props {
  top: TrendingStory[];
  rest: TrendingStory[];
}

export function TrendingClient({ top, rest }: Props) {
  const [active, setActive] = useState<TrendingStory | null>(null);

  const open = (s: TrendingStory, where: "top3" | "list") => {
    setActive(s);
    posthog.capture("trending_breakdown_opened", { id: s.id, where, sources: s.sources });
  };

  const empty = top.length === 0;

  return (
    <div className="scrollbar-none" style={{ height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "24px" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TrendingUp size={20} color="#f5f5f5" strokeWidth={2} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f5f5f5", margin: 0, letterSpacing: "-0.03em" }}>Trending</h1>
        </div>
        <p style={{ fontSize: "13px", color: "#737373", margin: "5px 0 0", lineHeight: 1.5 }}>
          The stories the most sources are covering right now.
        </p>
      </div>

      {empty ? (
        <div style={{ padding: "48px 32px", textAlign: "center", color: "#525252", fontSize: "14px", lineHeight: 1.6 }}>
          Nothing trending yet. Check back after the next refresh.
        </div>
      ) : (
        <>
          {/* ── Top 3 highlights ───────────────────────────────────────── */}
          <div style={{ padding: "16px 20px 6px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8B25C" }}>
              <Flame size={13} strokeWidth={2.4} /> Top 3 today
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "8px 20px 4px" }}>
            {top.map((s, i) => {
              const cat = getCategoryBySlug(s.categorySlug as CategorySlug);
              const accent = cat?.colorAccent ?? "#737373";
              return (
                <button
                  key={s.id}
                  onClick={() => open(s, "top3")}
                  style={{ position: "relative", display: "block", width: "100%", textAlign: "left", background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "16px 16px 14px", cursor: "pointer", color: "inherit", overflow: "hidden" }}
                >
                  {/* accent rail */}
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: accent }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                    {cat && (
                      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: cat.colorLabel, background: `${accent}14`, border: `1px solid ${accent}22`, padding: "2px 8px", borderRadius: "100px" }}>
                        {cat.name}
                      </span>
                    )}
                    {s.sources > 1 && (
                      <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: "#E8B25C", background: "rgba(232,178,92,0.12)", borderRadius: "100px", padding: "2px 8px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {s.sources} sources
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#E8E4DE", margin: 0, lineHeight: 1.34, letterSpacing: "-0.01em" }}>{s.title}</h2>
                  <p style={{ fontSize: "13.5px", color: "#9a9a9a", lineHeight: 1.5, margin: "7px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.summary}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                    <span style={{ fontSize: "11.5px", color: "#6a6a6a" }}>{s.sourceName} · {formatTimeAgo(s.publishedAt)}</span>
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: accent }}>
                      <Sparkles size={13} strokeWidth={2} /> Why it matters
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── More trending ──────────────────────────────────────────── */}
          {rest.length > 0 && (
            <>
              <div style={{ padding: "22px 20px 4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#525252" }}>More trending today</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "6px 0 0" }}>
                {rest.map((s) => {
                  const cat = getCategoryBySlug(s.categorySlug as CategorySlug);
                  const accent = cat?.colorAccent ?? "#737373";
                  return (
                    <button
                      key={s.id}
                      onClick={() => open(s, "list")}
                      style={{ display: "flex", alignItems: "flex-start", gap: "11px", width: "100%", textAlign: "left", padding: "13px 20px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", color: "inherit" }}
                    >
                      <span style={{ flexShrink: 0, width: "6px", height: "6px", borderRadius: "100px", background: accent, marginTop: "6px" }} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: "14.5px", fontWeight: 600, color: "#d8d4ce", lineHeight: 1.35, letterSpacing: "-0.01em" }}>{s.title}</span>
                        <span style={{ display: "block", fontSize: "11.5px", color: "#6a6a6a", marginTop: "4px" }}>
                          {s.sourceName} · {formatTimeAgo(s.publishedAt)}{s.sources > 1 ? ` · ${s.sources} sources` : ""}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {active && <BreakdownSheet item={active} open={!!active} onClose={() => setActive(null)} />}
    </div>
  );
}
