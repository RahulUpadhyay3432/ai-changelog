"use client";

import { useState, useEffect } from "react";
import { Bookmark, Brain, Rocket, Building2, FlaskConical, Wrench, DollarSign, Terminal, Server, Shield } from "lucide-react";
import type { Category } from "@/lib/types";
import { isCategoryPinned, toggleCategoryPin } from "@/lib/storage";

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Rocket,
  Building2,
  FlaskConical,
  Wrench,
  DollarSign,
  Terminal,
  Server,
  Shield,
};

interface CategoryCardProps {
  category: Category;
  onPress?: (slug: string) => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const [pinned, setPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const Icon = ICON_MAP[category.icon] ?? Brain;

  // Safe client-only read of pin state to avoid hydration mismatches
  useEffect(() => {
    setPinned(isCategoryPinned(category.slug));
  }, [category.slug]);

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = toggleCategoryPin(category.slug);
    setPinned(nextState);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPress?.(category.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPress?.(category.slug);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "16px",
        background: isHovered 
          ? "rgba(30, 30, 30, 0.85)" 
          : "rgba(22, 22, 22, 0.65)",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: isHovered 
          ? "rgba(255, 255, 255, 0.15)" 
          : "rgba(255, 255, 255, 0.06)",
        boxShadow: isHovered
          ? `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px ${category.colorAccent}25`
          : "0 4px 12px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
        textAlign: "left",
        position: "relative",
        minHeight: "115px",
        width: "100%",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Pin button */}
      <button
        onClick={handlePin}
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          color: pinned ? "#ef4444" : "rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          transform: pinned ? "scale(1.15)" : "scale(1)",
        }}
        aria-label={pinned ? "Unpin category" : "Pin category"}
      >
        <Bookmark
          size={16}
          fill={pinned ? "#ef4444" : "none"}
          strokeWidth={pinned ? 0 : 2}
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
          background: `${category.colorAccent}15`,
          border: `1px solid ${category.colorAccent}30`,
          boxShadow: `0 0 8px ${category.colorAccent}10`,
          transition: "all 0.3s ease",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        <Icon size={18} color={category.colorAccent} strokeWidth={2.5} />
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#f5f5f5",
          lineHeight: 1.3,
          paddingRight: "24px",
          letterSpacing: "-0.01em",
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
        <span style={{ fontSize: "11px", color: "#a3a3a3", fontWeight: 500 }}>
          {category.storyCount} dispatches
        </span>
        {category.lastUpdated && (
          <>
            <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.15)" }}>·</span>
            <span style={{ fontSize: "11px", color: "#737373" }}>
              {category.lastUpdated}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

