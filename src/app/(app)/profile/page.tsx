"use client";

import { useState, useEffect } from "react";
import { User, Bell, Bookmark, Flame, Sparkles, MessageSquare, Check } from "lucide-react";
import { getSavedStories, getStreak, getFeedPrefs, setFeedPrefs, getReadHistory } from "@/lib/storage";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";
import posthog from "posthog-js";

const ALL_SLUGS = CATEGORIES.map((c) => c.slug);

export default function ProfilePage() {
  const [savedCount, setSavedCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  // enabled slugs — null until loaded (avoids flash)
  const [enabledSlugs, setEnabledSlugs] = useState<string[] | null>(null);
  const [topCategories, setTopCategories] = useState<{ slug: string; count: number }[]>([]);
  const [readTotal, setReadTotal] = useState(0);
  const [quietestSlug, setQuietestSlug] = useState<string | null>(null);

  useEffect(() => {
    setSavedCount(getSavedStories().length);
    setStreakCount(getStreak());
    const raw = getFeedPrefs();
    // Old implementation stored all 9 by default — that's not a real selection.
    // Reset to empty so new additive model starts clean.
    if (raw !== null && raw.length === ALL_SLUGS.length) {
      setFeedPrefs([]);
      setEnabledSlugs([]);
    } else {
      setEnabledSlugs(raw ?? []);
    }

    // Compute read-history summary
    const history = getReadHistory();
    setReadTotal(history.length);
    const counts: Record<string, number> = {};
    for (const r of history) {
      if (r.categorySlug === "all") continue;
      counts[r.categorySlug] = (counts[r.categorySlug] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count);
    setTopCategories(sorted.slice(0, 3));
    // Find a real category the user hasn't read at all
    const unread = CATEGORIES.find((c) => !counts[c.slug]);
    setQuietestSlug(unread?.slug ?? null);

    setIsLoading(false);
  }, []);

  const toggleCategory = (slug: string) => {
    setEnabledSlugs((prev) => {
      const current = prev ?? [];
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      setFeedPrefs(next);
      posthog.capture("feed_prefs_changed", {
        toggled: slug,
        selected: next,
        selected_count: next.length,
      });
      return next;
    });
  };

  const isSelected = (slug: string) => (enabledSlugs ?? []).includes(slug);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
        overflowY: "auto",
      }}
      className="scrollbar-none"
    >
      {/* Avatar section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "45px 20px 32px",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <User size={36} color="#a3a3a3" strokeWidth={1.5} />
          <div
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.04)",
              pointerEvents: "none",
            }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#f5f5f5", margin: 0, letterSpacing: "-0.02em" }}>
              Reader
            </p>
            <Sparkles size={16} color="#fbbf24" style={{ opacity: streakCount > 0 ? 1 : 0.3 }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "12px", padding: "0 20px", marginBottom: "28px" }}>
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Bookmark size={16} color="#fbbf24" style={{ opacity: savedCount > 0 ? 1 : 0.4 }} />
          <span style={{ fontSize: "24px", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1, marginTop: "4px" }}>
            {isLoading ? "—" : savedCount}
          </span>
          <span style={{ fontSize: "11px", color: "#737373", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Saved
          </span>
        </div>

        <div
          style={{
            flex: 1,
            background: streakCount > 0 ? "rgba(249,115,22,0.04)" : "rgba(255,255,255,0.02)",
            border: streakCount > 0 ? "1px solid rgba(249,115,22,0.2)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            boxShadow: streakCount > 0 ? "0 0 16px rgba(249,115,22,0.08)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <Flame
            size={18}
            color={streakCount > 0 ? "#f97316" : "#525252"}
            fill={streakCount > 0 ? "#f97316" : "none"}
            className={streakCount > 0 ? "animate-bounce" : ""}
            style={{ animationDuration: "2s" }}
          />
          <span style={{ fontSize: "24px", fontWeight: 800, color: streakCount > 0 ? "#f97316" : "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1, marginTop: "2px" }}>
            {isLoading ? "—" : `${streakCount}d`}
          </span>
          <span style={{ fontSize: "11px", color: streakCount > 0 ? "#ea580c" : "#737373", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Streak
          </span>
        </div>
      </div>

      {/* Your AI */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#525252",
            margin: "0 0 10px",
            padding: "0 24px",
          }}
        >
          Your AI
        </p>
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "16px 20px",
          }}
        >
          {readTotal === 0 ? (
            <p style={{ margin: 0, fontSize: "14px", color: "#525252", lineHeight: 1.5 }}>
              Start reading to build your map.
            </p>
          ) : (
            <>
              <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#a3a3a3", lineHeight: 1.5 }}>
                You&apos;ve read{" "}
                <span style={{ color: "#f5f5f5", fontWeight: 600 }}>{readTotal}</span>{" "}
                {readTotal === 1 ? "dispatch" : "dispatches"} across{" "}
                <span style={{ color: "#f5f5f5", fontWeight: 600 }}>{topCategories.length}</span> of 9 areas.
              </p>
              {topCategories.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#525252", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Top areas
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {topCategories.map(({ slug, count }) => {
                      const cat = getCategoryBySlug(slug as Parameters<typeof getCategoryBySlug>[0]);
                      if (!cat) return null;
                      return (
                        <div
                          key={slug}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            border: `1px solid ${cat.colorAccent}55`,
                            background: `${cat.colorAccent}14`,
                            color: cat.colorLabel,
                            fontSize: "13px",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {cat.name}
                          <span style={{ fontSize: "11px", opacity: 0.6 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {quietestSlug && (() => {
                const cat = getCategoryBySlug(quietestSlug as Parameters<typeof getCategoryBySlug>[0]);
                if (!cat) return null;
                return (
                  <p style={{ margin: 0, fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>
                    You haven&apos;t explored{" "}
                    <span style={{ color: "#737373" }}>{cat.name}</span> yet.
                  </p>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Feed preferences */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#525252",
            margin: "0 0 10px",
            padding: "0 24px",
          }}
        >
          Your Feed
        </p>
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "16px 20px",
          }}
        >
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>
            Pick the topics you want in your All Dispatches feed.{" "}
            {(enabledSlugs ?? []).length === 0 && (
              <span style={{ color: "#404040" }}>Nothing selected shows everything.</span>
            )}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map((cat) => {
              const selected = isSelected(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  style={{
                    padding: "7px 14px",
                    paddingLeft: selected ? "10px" : "14px",
                    borderRadius: "20px",
                    border: `1px solid ${selected ? cat.colorAccent + "66" : "rgba(255,255,255,0.07)"}`,
                    background: selected ? cat.colorAccent + "18" : "rgba(255,255,255,0.02)",
                    color: selected ? cat.colorLabel : "#444",
                    fontSize: "13px",
                    fontWeight: selected ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: "0.01em",
                    WebkitTapHighlightColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {selected && <Check size={11} strokeWidth={3} color={cat.colorLabel} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
          {(enabledSlugs ?? []).length > 0 && (
            <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#404040" }}>
              {enabledSlugs!.length} of {ALL_SLUGS.length} topics selected
            </p>
          )}
        </div>
      </div>

      {/* Preferences section */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#525252",
            margin: "0 0 10px",
            padding: "0 24px",
          }}
        >
          Preferences
        </p>
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <button
            disabled
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              background: "none",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              cursor: "default",
              color: "#737373",
              fontSize: "15px",
              fontWeight: 500,
              opacity: 0.7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Bell size={16} color="#525252" strokeWidth={2} />
              <span>Notifications</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#525252", letterSpacing: "0.04em" }}>SOON</span>
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#a3a3a3",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MessageSquare size={16} color="#a3a3a3" strokeWidth={2} />
              <span>Share feedback</span>
            </div>
            <span style={{ fontSize: "16px", color: "#525252" }}>→</span>
          </button>
        </div>
      </div>

      <FeedbackSheet open={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* About */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#525252",
            margin: "0 0 10px",
            padding: "0 24px",
          }}
        >
          About
        </p>
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "16px 24px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#a3a3a3", lineHeight: 1.6, margin: "0 0 12px", fontWeight: 500 }}>
            Kapyn delivers AI and tech news in 30-second reads — no noise, no paywalls.
          </p>
          <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6, margin: 0 }}>
            Sources: OpenAI Blog · Google DeepMind · Hugging Face · TechCrunch AI · VentureBeat · The Verge · Ars Technica · MIT Tech Review · Microsoft AI
          </p>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: "12px", color: "#404040", marginTop: "auto", padding: "24px" }}>
        Kapyn v1.0.0 · What happened in AI today.
      </p>
    </div>
  );
}
