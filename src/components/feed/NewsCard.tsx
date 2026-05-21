"use client";

import { useState, useEffect } from "react";
import { Bookmark, Share2, ChevronUp, ChevronDown, Check } from "lucide-react";
import { getCategoryBySlug } from "@/lib/categories";
import { formatTimeAgo } from "@/lib/mock-data";
import type { NewsItem } from "@/lib/types";
import { isStorySaved, saveStory, removeStory } from "@/lib/storage";
import posthog from "posthog-js";

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
      {/* Ambient glow */}
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
        <rect width="100%" height="100%" fill={`url(#grid-${categorySlug})`} />
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
    .replace(/<[^>]*>/g, "")
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
  const [sharePressed, setSharePressed] = useState(false);
  const category = getCategoryBySlug(item.categorySlug as never);
  const timeAgo = formatTimeAgo(item.publishedAt);

  useEffect(() => {
    setSaved(isStorySaved(item.id));
  }, [item.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeStory(item.id);
      setSaved(false);
      posthog.capture("story_unbookmarked", {
        story_id: item.id,
        story_title: item.title,
        category: item.categorySlug,
        source_name: item.sourceName,
      });
    } else {
      saveStory(item);
      setSaved(true);
      posthog.capture("story_bookmarked", {
        story_id: item.id,
        story_title: item.title,
        category: item.categorySlug,
        source_name: item.sourceName,
      });
    }
    onSave?.(item.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSharePressed(true);
    setTimeout(() => setSharePressed(false), 200);
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: item.sourceUrl });
        posthog.capture("story_shared", {
          story_id: item.id,
          story_title: item.title,
          category: item.categorySlug,
          source_name: item.sourceName,
          share_method: "native",
        });
      } else {
        await navigator.clipboard.writeText(item.sourceUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        posthog.capture("story_shared", {
          story_id: item.id,
          story_title: item.title,
          category: item.categorySlug,
          source_name: item.sourceName,
          share_method: "clipboard",
        });
      }
    } catch {
      await navigator.clipboard.writeText(item.sourceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      posthog.capture("story_shared", {
        story_id: item.id,
        story_title: item.title,
        category: item.categorySlug,
        source_name: item.sourceName,
        share_method: "clipboard_fallback",
      });
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
        position: "relative",
      }}
    >
      {/* Hero — slightly taller for cinematic feel */}
      <div style={{ position: "relative", flex: "0 0 42%", overflow: "hidden" }}>
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

        {/* Gradient fade into content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.35) 55%, rgba(10,10,10,0) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

      </div>

      {/* Inshorts-style action buttons — horizontal pill at image/text boundary */}
      <div
        style={{
          position: "absolute",
          right: "12px",
          top: "calc(42% - 22px)",
          zIndex: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "0px",
          background: "rgba(0, 0, 0, 0.70)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRadius: "8px",
          padding: "0 2px",
        }}
      >
        <button
          onClick={handleSave}
          className={`card-action-btn${saved ? " bookmark-saved" : ""}`}
          aria-label={saved ? "Remove bookmark" : "Bookmark story"}
          style={{
            width: "44px",
            height: "44px",
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: "12px",
          }}
        >
          <Bookmark
            size={20}
            fill={saved ? "#fbbf24" : "none"}
            color={saved ? "#fbbf24" : "#ffffff"}
            strokeWidth={saved ? 0 : 2}
            style={{ transition: "fill 0.2s ease, color 0.2s ease" }}
          />
        </button>
        <button
          onClick={handleShare}
          className={`card-action-btn${sharePressed ? " share-pulse" : ""}`}
          aria-label="Share story"
          style={{
            width: "44px",
            height: "44px",
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: "12px",
          }}
        >
          {copied ? (
            <Check size={20} color="#4ade80" strokeWidth={2.5} />
          ) : (
            <Share2 size={20} color="#ffffff" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px 20px 8px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Category + time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: category?.colorLabel ?? "#a3a3a3",
              background: category
                ? `${category.colorAccent}12`
                : "rgba(255,255,255,0.04)",
              border: category
                ? `1px solid ${category.colorAccent}20`
                : "1px solid rgba(255,255,255,0.07)",
              padding: "2px 8px",
              borderRadius: "100px",
            }}
          >
            {category?.name ?? item.categorySlug}
          </span>
          <span
            style={{ fontSize: "10px", color: "#555", fontWeight: 500 }}
            suppressHydrationWarning
          >
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            posthog.capture("story_link_clicked", {
              story_id: item.id,
              story_title: item.title,
              category: item.categorySlug,
              source_name: item.sourceName,
              url: item.sourceUrl,
            });
          }}
          className="news-title-link"
          style={{
            fontSize: "25px",
            fontWeight: 300,
            lineHeight: 1.28,
            color: "#E8E4DE",
            margin: 0,
            marginBottom: "8px",
            letterSpacing: "0.01em",
            textDecoration: "none",
            display: "block",
            flexShrink: 0,
            transition: "opacity 0.15s ease",
          }}
        >
          {item.title}
        </a>

        {/* Summary — fills remaining space */}
        <p
          style={{
            fontSize: "13.5px",
            lineHeight: 1.58,
            color: "#888",
            margin: 0,
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 7,
            WebkitBoxOrient: "vertical",
          }}
        >
          {cleanText(item.summary)}
        </p>

        {/* Footer: source + swipe indicators — merged into one compact row */}
        <div
          style={{
            paddingTop: "8px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "#444",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {item.sourceName}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              color: "rgba(255,255,255,0.1)",
            }}
          >
            <ChevronUp size={11} strokeWidth={2} />
            <ChevronDown size={11} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
