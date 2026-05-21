"use client";

import { useState, useEffect } from "react";
import { Bookmark, Share2, ChevronUp, ChevronDown, Check } from "lucide-react";
import { getCategoryBySlug } from "@/lib/categories";
import { formatTimeAgo } from "@/lib/mock-data";
import type { NewsItem } from "@/lib/types";
import { isStorySaved, saveStory, removeStory } from "@/lib/storage";

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

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function NewsCard({ item, onSave, isSaved = false }: NewsCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [copied, setCopied] = useState(false);
  const category = getCategoryBySlug(item.categorySlug as never);
  const timeAgo = formatTimeAgo(item.publishedAt);

  // Sync state safely on the client
  useEffect(() => {
    setSaved(isStorySaved(item.id));
  }, [item.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeStory(item.id);
      setSaved(false);
    } else {
      saveStory(item);
      setSaved(true);
    }
    onSave?.(item.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: item.sourceUrl });
      } else {
        await navigator.clipboard.writeText(item.sourceUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(item.sourceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0a",
        userSelect: "none",
      }}
    >
      {/* Hero image area */}
      <div style={{ position: "relative", flex: "0 0 38%", overflow: "hidden" }}>
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

        {/* Ambient Gradient overlay to improve readability of elements on top of images */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

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
              background: "rgba(10, 10, 10, 0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: saved ? "#fbbf24" : "#f5f5f5",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: saved ? "scale(1.05)" : "scale(1)",
            }}
            aria-label={saved ? "Remove bookmark" : "Bookmark story"}
          >
            <Bookmark
              size={16}
              fill={saved ? "#fbbf24" : "none"}
              strokeWidth={saved ? 0 : 2}
            />
          </button>
          <button
            onClick={handleShare}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(10, 10, 10, 0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: copied ? "#4ade80" : "#f5f5f5",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            aria-label="Share story"
          >
            {copied ? (
              <Check size={16} color="#4ade80" strokeWidth={2.5} />
            ) : (
              <Share2 size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "12px 20px 10px",
          overflow: "hidden",
        }}
      >
        {/* Category + time row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: category?.colorLabel ?? "#a3a3a3",
              background: category
                ? `${category.colorAccent}15`
                : "rgba(255,255,255,0.05)",
              border: category
                ? `1px solid ${category.colorAccent}25`
                : "1px solid rgba(255,255,255,0.08)",
              padding: "3px 9px",
              borderRadius: "100px",
            }}
          >
            {category?.name ?? item.categorySlug}
          </span>
          <span style={{ fontSize: "11px", color: "#737373", fontWeight: 500 }} suppressHydrationWarning>
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
            fontSize: "23px",
            fontWeight: 800,
            lineHeight: 1.25,
            color: "#f5f5f5",
            margin: 0,
            marginBottom: "10px",
            letterSpacing: "-0.03em",
            textDecoration: "none",
            display: "block",
            transition: "color 0.2s ease",
          }}
          className="hover:text-white"
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
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
          }}
        >
          {cleanText(item.summary)}
        </p>

        {/* Source */}
        <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#737373", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {item.sourceName}
          </span>
        </div>

        {/* Swipe hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            paddingTop: "8px",
            color: "rgba(255, 255, 255, 0.12)",
          }}
        >
          <ChevronUp size={12} />
          <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Swipe for next
          </span>
          <ChevronDown size={12} />
        </div>
      </div>
    </div>
  );
}

