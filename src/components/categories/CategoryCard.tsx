"use client";

import { useState } from "react";
import { Bookmark, Brain, Rocket, Building2, FlaskConical, Wrench, Code2, DollarSign, Zap } from "lucide-react";
import type { Category } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Rocket,
  Building2,
  FlaskConical,
  Wrench,
  Code2,
  DollarSign,
  Zap,
};

interface CategoryCardProps {
  category: Category;
  onPress?: (slug: string) => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const [pinned, setPinned] = useState(false);
  const Icon = ICON_MAP[category.icon] ?? Brain;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPress?.(category.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPress?.(category.slug);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px",
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        cursor: "pointer",
        textAlign: "left",
        position: "relative",
        minHeight: "100px",
        width: "100%",
        transition: "box-shadow 150ms",
      }}
    >
      {/* Pin button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          color: pinned ? "#ef4444" : "#d4d4d4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 200ms",
        }}
        aria-label={pinned ? "Unpin category" : "Pin category"}
      >
        <Bookmark
          size={16}
          fill={pinned ? "#ef4444" : "none"}
          strokeWidth={2}
        />
      </button>

      {/* Icon */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${category.colorAccent}20`,
        }}
      >
        <Icon size={20} color={category.colorAccent} strokeWidth={2} />
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#0a0a0a",
          lineHeight: 1.2,
          paddingRight: "24px",
        }}
      >
        {category.name}
      </span>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "auto",
        }}
      >
        <span style={{ fontSize: "12px", color: "#737373" }}>
          {category.storyCount} stories
        </span>
        {category.lastUpdated && (
          <>
            <span style={{ fontSize: "12px", color: "#d4d4d4" }}>·</span>
            <span style={{ fontSize: "12px", color: "#737373" }}>
              {category.lastUpdated}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
