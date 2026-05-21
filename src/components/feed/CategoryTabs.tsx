"use client";

import { useRef, useEffect } from "react";
import { CATEGORY_TABS } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";

interface CategoryTabsProps {
  activeSlug: CategorySlug;
  onChange: (slug: CategorySlug) => void;
}

export function CategoryTabs({ activeSlug, onChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeSlug]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-none"
      style={{
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        padding: "6px 16px 6px",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      {CATEGORY_TABS.map(({ slug, label }) => {
        const active = slug === activeSlug;
        return (
          <button
            key={slug}
            ref={active ? activeRef : undefined}
            onClick={() => onChange(slug)}
            className={`category-tab-btn${active ? " active-pill" : ""}`}
            style={{
              flexShrink: 0,
              padding: "5px 13px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: active ? 700 : 500,
              border: "1px solid",
              borderColor: active
                ? "rgba(251, 146, 60, 0.0)"
                : "rgba(255, 255, 255, 0.08)",
              background: active
                ? "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)"
                : "transparent",
              color: active ? "#fff" : "#555555",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              letterSpacing: active ? "0.01em" : "0.015em",
              whiteSpace: "nowrap",
              boxShadow: active ? "0 2px 10px rgba(249, 115, 22, 0.35)" : "none",
            }}
          >
            {label === "All" ? "All Dispatches" : label}
          </button>
        );
      })}
    </div>
  );
}
