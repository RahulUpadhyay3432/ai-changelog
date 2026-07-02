"use client";

import { useState } from "react";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { CATEGORIES, CATEGORY_TABS } from "@/lib/categories";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredCategories = activeTab === "all" 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.slug === activeTab);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "var(--kt-canvas, #0a0a0a)",
        display: "flex",
        flexDirection: "column",
      }}
      className="scrollbar-none"
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <h1
          className="text-gradient"
          style={{
            fontSize: "26px",
            fontWeight: 800,
            letterSpacing: "0.15em",
            margin: "0 0 6px",
            textTransform: "uppercase",
          }}
        >
          Categories
        </h1>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: "var(--kt-text-muted, #737373)",
            textTransform: "uppercase",
            margin: "0 0 24px",
          }}
        >
          Browse &amp; filter tech intelligence
        </p>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            width: "100%",
            paddingBottom: "16px",
          }}
          className="scrollbar-none"
        >
          {CATEGORY_TABS.map(({ slug, label }) => {
            const isActive = activeTab === slug;
            return (
              <button
                key={slug}
                onClick={() => setActiveTab(slug)}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 400,
                  border: "1px solid",
                  borderColor: isActive ? "rgba(255,255,255,0.25)" : "var(--kt-hairline, rgba(255,255,255,0.08))",
                  background: isActive ? "var(--kt-hairline, rgba(255,255,255,0.12))" : "rgba(255,255,255,0.02)",
                  color: isActive ? "#ffffff" : "var(--kt-text-muted, #a3a3a3)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {label === "All" ? "All Dispatches" : label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category grid */}
      <CategoryGrid categories={filteredCategories} />
    </div>
  );
}

