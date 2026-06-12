"use client";

import type { Insight } from "@/lib/types";

interface InsightEntryCardProps {
  insight: Insight;
  onTap: () => void;
}

export function InsightEntryCard({ insight, onTap }: InsightEntryCardProps) {
  return (
    <div
      onClick={onTap}
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0d0d0d",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {insight.coverImageUrl && (
        <>
          {/* Blurred fill — soft continuation of the image behind the
              letterbox gaps, so any aspect-ratio mismatch reads as
              intentional depth rather than hard black bars */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={insight.coverImageUrl}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(28px) brightness(0.5)",
              transform: "scale(1.15)",
            }}
          />
          {/* Sharp, complete image — never cropped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={insight.coverImageUrl}
            alt={insight.title}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
            }}
          />
        </>
      )}
    </div>
  );
}
