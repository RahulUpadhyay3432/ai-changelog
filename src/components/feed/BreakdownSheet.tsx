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
            <X size={16} color="#666" strokeWidth={2} />
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
              `}</style>
              <p
                style={{
                  fontSize: "11px",
                  color: "#444",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                Analysing what matters...
              </p>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
                Couldn't load explanation
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
