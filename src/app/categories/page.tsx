import { Bookmark } from "lucide-react";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { CATEGORIES, CATEGORY_TABS } from "@/lib/categories";

export default function CategoriesPage() {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
      className="scrollbar-none"
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <button
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#0a0a0a",
            padding: "4px",
          }}
          aria-label="Saved categories"
        >
          <Bookmark size={20} strokeWidth={2} />
        </button>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#0a0a0a",
            margin: "0 0 4px",
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
            color: "#737373",
            textTransform: "uppercase",
            margin: "0 0 20px",
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
          {CATEGORY_TABS.map(({ slug, label }) => (
            <button
              key={slug}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: "100px",
                fontSize: "13px",
                fontWeight: 400,
                border: "1px solid rgba(0,0,0,0.15)",
                background: "transparent",
                color: "#525252",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {label === "All" ? "All Dispatches" : label}
            </button>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <CategoryGrid categories={CATEGORIES} />
    </div>
  );
}
