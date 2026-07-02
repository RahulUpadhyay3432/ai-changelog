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
              fontSize: "13px",
              fontWeight: active ? 700 : 500,
              border: "1px solid",
              borderColor: active
                ? "transparent"
                : "var(--kt-hairline, rgba(255, 255, 255, 0.08))",
              background: active ? "#1565C0" : "transparent",
              color: active ? "#fff" : "var(--kt-text-muted, #9a948b)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              letterSpacing: active ? "0.01em" : "0.015em",
              whiteSpace: "nowrap",
              boxShadow: active ? "0 2px 12px rgba(21, 101, 192, 0.4)" : "none",
            }}
          >
            {label === "All" ? "All Dispatches" : label}
          </button>
        );
      })}
    </div>
  );
}
