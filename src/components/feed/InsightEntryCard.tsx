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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={insight.coverImageUrl}
          alt={insight.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
          }}
        />
      )}
    </div>
  );
}
