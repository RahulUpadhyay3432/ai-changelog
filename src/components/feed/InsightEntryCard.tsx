"use client";

import type { Insight } from "@/lib/types";

interface InsightEntryCardProps {
  insight: Insight;
  onTap: () => void;
}

export function InsightEntryCard({ insight, onTap }: InsightEntryCardProps) {
  const accent = insight.accentColor;
  const slideCount = insight.slides.length;

  return (
    <div
      onClick={onTap}
      style={{
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "32px 24px",
        cursor: "pointer",
        overflow: "hidden",
        background: "#0d0d0d",
        userSelect: "none",
      }}
    >
      {/* Cover image */}
      {insight.coverImageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${insight.coverImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
          }}
        />
      )}

      {/* Bottom-heavy gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, #0a0a0a 50%, rgba(10,10,10,0.5) 100%)",
        }}
      />

      {/* Accent line at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(to right, ${accent}, ${accent}80)`,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Label chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: accent,
            border: `1px solid ${accent}50`,
            background: `${accent}15`,
            padding: "3px 10px",
            borderRadius: "100px",
            marginBottom: "20px",
          }}
        >
          Insight
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "34px",
            fontWeight: 700,
            color: "#E8E4DE",
            margin: "0 0 10px",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}
        >
          {insight.title}
        </h2>

        {/* Subtitle */}
        {insight.subtitle && (
          <p
            style={{
              fontSize: "15px",
              color: "#737373",
              margin: "0 0 28px",
              lineHeight: 1.5,
              maxWidth: "280px",
            }}
          >
            {insight.subtitle}
          </p>
        )}

        {/* CTA row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: accent,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              letterSpacing: "0.01em",
            }}
          >
            Tap to read <span>→</span>
          </span>

          {slideCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {Array.from({ length: Math.min(slideCount, 7) }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              ))}
              <span style={{ fontSize: "11px", color: "#555", marginLeft: "4px" }}>
                {slideCount} parts
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
