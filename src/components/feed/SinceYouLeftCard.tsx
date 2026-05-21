"use client";

import { useMemo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { X, Check, Zap } from "lucide-react";
import type { NewsItem } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  "ai-models": "AI / Models",
  "dev-tools": "Dev Tools",
  "startups": "Startups",
  "research": "Research",
  "funding-ma": "Funding",
  "big-tech": "Big Tech",
  "infrastructure": "Infra",
  "policy": "Policy",
};

function formatSinceTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 2) return "an hour ago";
  if (hours < 5) return "a few hours ago";
  if (hours < 10) return "earlier today";
  if (hours < 18) return "this afternoon";
  if (hours < 24) return "last night";
  if (hours < 36) return "yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}

interface SinceYouLeftCardProps {
  allItems: NewsItem[];
  lastVisitTimestamp: number | null;
  isFirstTime: boolean;
  onDismiss: () => void;
  onStartReading: () => void;
  onQuickCatchUp: (newItems: NewsItem[]) => void;
}

export function SinceYouLeftCard({
  allItems,
  lastVisitTimestamp,
  isFirstTime,
  onDismiss,
  onStartReading,
  onQuickCatchUp,
}: SinceYouLeftCardProps) {
  const y = useMotionValue(0);

  const newItems = useMemo(() => {
    if (isFirstTime || !lastVisitTimestamp) return allItems;
    return allItems.filter(
      (item) => new Date(item.publishedAt).getTime() > lastVisitTimestamp
    );
  }, [allItems, lastVisitTimestamp, isFirstTime]);

  const topStory = newItems[0] ?? null;

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    newItems.forEach((item) => {
      counts[item.categorySlug] = (counts[item.categorySlug] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [newItems]);

  const isEmpty = newItems.length === 0 && !isFirstTime;

  return (
    /* Full-area overlay */
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        padding: "12px 16px 16px",
        background: "rgba(10,10,10,0.82)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <motion.div
        style={{ y }}
        drag="y"
        dragConstraints={{ top: -400, bottom: 0 }}
        dragElastic={{ top: 0.25, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < -55 || info.velocity.y < -400) {
            onDismiss();
          } else {
            animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
          }
        }}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Card */}
        <div
          style={{
            background: "rgba(18,18,18,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "20px 20px 16px",
            position: "relative",
          }}
        >
          {/* Dismiss X */}
          <button
            onClick={onDismiss}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#666",
            }}
            aria-label="Dismiss"
          >
            <X size={13} strokeWidth={2} />
          </button>

          {isEmpty ? (
            /* Empty state */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px 0 8px",
                gap: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "4px",
                }}
              >
                <Check size={16} color="#4ade80" strokeWidth={2.5} />
              </div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#E8E4DE",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                You&apos;re all caught up.
              </p>
              <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
                Nothing new since you left.
                <br />
                Come back later for fresh intelligence.
              </p>
            </div>
          ) : (
            <>
              {/* Header label */}
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#d97706",
                  margin: "0 0 10px",
                  fontVariant: "small-caps",
                }}
              >
                {isFirstTime ? "Welcome to Kapyn" : "Since you left"}
              </p>

              {/* Main count line */}
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "#E8E4DE",
                  margin: "0 0 6px",
                  lineHeight: 1.25,
                  paddingRight: "24px",
                }}
              >
                {isFirstTime
                  ? `${newItems.length} dispatches ready for you.`
                  : `${newItems.length} new dispatch${newItems.length !== 1 ? "es" : ""} since ${formatSinceTime(lastVisitTimestamp!)}`}
              </p>

              {/* Category breakdown */}
              {categoryBreakdown.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginBottom: "14px",
                  }}
                >
                  {categoryBreakdown.map(([slug, count]) => (
                    <span
                      key={slug}
                      style={{
                        fontSize: "10px",
                        fontWeight: 500,
                        color: "#737373",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "100px",
                        padding: "2px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {count} {CATEGORY_LABELS[slug] ?? slug}
                    </span>
                  ))}
                </div>
              )}

              {/* Top story preview */}
              {topStory && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#525252",
                      margin: "0 0 5px",
                    }}
                  >
                    Top Story
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#c4c4c4",
                      margin: 0,
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {topStory.title}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={onStartReading}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                    border: "none",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                  }}
                >
                  Start Reading
                </button>
                <button
                  onClick={() => onQuickCatchUp(newItems)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: "10px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#a3a3a3",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <Zap size={13} strokeWidth={2} />
                  Quick Catch-Up
                </button>
              </div>
            </>
          )}

          {/* Swipe hint */}
          <p
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#333",
              margin: "12px 0 0",
            }}
          >
            swipe up to dismiss
          </p>
        </div>
      </motion.div>
    </div>
  );
}
