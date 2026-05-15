"use client";

import { useState } from "react";
import { Bookmark, Share2, ChevronUp, ChevronDown } from "lucide-react";
import { getCategoryBySlug } from "@/lib/categories";
import { formatTimeAgo } from "@/lib/mock-data";
import type { NewsItem } from "@/lib/types";

interface NewsCardProps {
  item: NewsItem;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

function CardHeroBackground({ categorySlug }: { categorySlug: string }) {
  const category = getCategoryBySlug(categorySlug as never);
  const accent = category?.colorAccent ?? "#333";
  const bg = category?.colorBg ?? "#111";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 60% 40%, ${accent}55 0%, ${bg} 65%)`,
        overflow: "hidden",
      }}
    >
      {/* Ambient glow circles */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      {/* Grid overlay */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.04 }}
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={`grid-${categorySlug}`}
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-${categorySlug})`}
        />
      </svg>
      {/* Floating nodes */}
      {[
        { x: "20%", y: "30%", r: 3, o: 0.5 },
        { x: "45%", y: "55%", r: 5, o: 0.4 },
        { x: "70%", y: "25%", r: 2, o: 0.6 },
        { x: "80%", y: "60%", r: 4, o: 0.3 },
        { x: "35%", y: "70%", r: 3, o: 0.5 },
      ].map((node, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            width: node.r * 2,
            height: node.r * 2,
            borderRadius: "50%",
            background: accent,
            opacity: node.o,
            boxShadow: `0 0 ${node.r * 4}px ${accent}`,
          }}
        />
      ))}
    </div>
  );
}

export function NewsCard({ item, onSave, isSaved = false }: NewsCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const category = getCategoryBySlug(item.categorySlug as never);
  const timeAgo = formatTimeAgo(item.publishedAt);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((s) => !s);
    onSave?.(item.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({ title: item.title, url: item.sourceUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(item.sourceUrl).catch(() => {});
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#111111",
        userSelect: "none",
      }}
    >
      {/* Hero image area */}
      <div style={{ position: "relative", flex: "0 0 36%", overflow: "hidden" }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <CardHeroBackground categorySlug={item.categorySlug} />
        )}

        {/* Action buttons */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            gap: "8px",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleSave}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: saved ? "#fbbf24" : "#f5f5f5",
              transition: "color 200ms",
            }}
            aria-label={saved ? "Remove bookmark" : "Bookmark story"}
          >
            <Bookmark
              size={16}
              fill={saved ? "#fbbf24" : "none"}
              strokeWidth={2}
            />
          </button>
          <button
            onClick={handleShare}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#f5f5f5",
            }}
            aria-label="Share story"
          >
            <Share2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px 12px",
          overflow: "hidden",
        }}
      >
        {/* Category + time row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: category?.colorLabel ?? "#a3a3a3",
              background: category
                ? `${category.colorAccent}20`
                : "rgba(255,255,255,0.1)",
              padding: "3px 8px",
              borderRadius: "4px",
            }}
          >
            {category?.name ?? item.categorySlug}
          </span>
          <span style={{ fontSize: "12px", color: "#525252" }} suppressHydrationWarning>
            {timeAgo}
          </span>
        </div>

        {/* Title — tappable, opens source */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: "22px",
            fontWeight: 700,
            lineHeight: 1.3,
            color: "#f5f5f5",
            margin: 0,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
            textDecoration: "none",
            display: "block",
          }}
        >
          {item.title}
        </a>

        {/* Summary */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.65,
            color: "#a3a3a3",
            margin: 0,
            marginBottom: "auto",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.summary}
        </p>

        {/* Source */}
        <div style={{ paddingTop: "12px" }}>
          <span style={{ fontSize: "12px", color: "#525252" }}>
            · {item.sourceName}
          </span>
        </div>

        {/* Swipe hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            paddingTop: "10px",
            color: "#404040",
          }}
        >
          <ChevronUp size={14} />
          <span style={{ fontSize: "11px", letterSpacing: "0.04em" }}>
            Swipe for next story
          </span>
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}
