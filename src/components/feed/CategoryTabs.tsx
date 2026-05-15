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
        gap: "8px",
        overflowX: "auto",
        padding: "12px 16px",
        flexShrink: 0,
      }}
    >
      {CATEGORY_TABS.map(({ slug, label }) => {
        const active = slug === activeSlug;
        return (
          <button
            key={slug}
            ref={active ? activeRef : undefined}
            onClick={() => onChange(slug)}
            style={{
              flexShrink: 0,
              padding: "7px 16px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: active ? 600 : 400,
              border: active
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.15)",
              background: active ? "#f5f5f5" : "transparent",
              color: active ? "#0a0a0a" : "#a3a3a3",
              cursor: "pointer",
              transition: "all 150ms",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
