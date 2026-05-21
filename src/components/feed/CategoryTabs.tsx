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
            style={{
              flexShrink: 0,
              padding: "5px 12px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: active ? 600 : 400,
              border: "1px solid",
              borderColor: active
                ? "rgba(255, 255, 255, 0.28)"
                : "rgba(255, 255, 255, 0.07)",
              background: active
                ? "rgba(255, 255, 255, 0.13)"
                : "transparent",
              color: active ? "#f0f0f0" : "#606060",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              letterSpacing: "0.015em",
              whiteSpace: "nowrap",
            }}
          >
            {label === "All" ? "All Dispatches" : label}
          </button>
        );
      })}
    </div>
  );
}
