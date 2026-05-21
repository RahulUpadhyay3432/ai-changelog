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
        padding: "8px 16px 8px",
        flexShrink: 0,
        background: "rgba(10, 10, 10, 0.5)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
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
              padding: "7px 15px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: active ? 600 : 400,
              border: "1px solid",
              borderColor: active
                ? "rgba(255, 255, 255, 0.25)"
                : "rgba(255, 255, 255, 0.08)",
              background: active ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.02)",
              color: active ? "#ffffff" : "#a3a3a3",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              letterSpacing: "0.02em",
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

