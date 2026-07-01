"use client";

import { useState, useEffect, memo } from "react";
import {
  Bookmark, Share2, Check, Sparkles,
  Brain, Terminal, GitBranch, Rocket, Telescope, Banknote, Building2, Server, Scale,
  type LucideIcon,
} from "lucide-react";
import { getCategoryBySlug } from "@/lib/categories";
import { formatTimeAgo } from "@/lib/mock-data";
import type { NewsItem } from "@/lib/types";
import { isStorySaved, saveStory, removeStory } from "@/lib/storage";
import { BreakdownSheet } from "./BreakdownSheet";
import posthog from "posthog-js";

interface NewsCardProps {
  item: NewsItem;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

// The card summary is generated at ingestion by this model (api/news/fetch).
// Hardcoded for the attribution label (true for the vast majority of stories).
const SUMMARY_MODEL = "Gemini 2.5 Flash Lite";

// One representative mark per category — turns an image-less story into an
// intentional, consistent "cover" instead of an empty gradient.
const CATEGORY_ICON: Record<string, LucideIcon> = {
  "ai-models": Brain,
  "dev-tools": Terminal,
  "open-source": GitBranch,
  startups: Rocket,
  research: Telescope,
  "funding-ma": Banknote,
  "big-tech": Building2,
  infrastructure: Server,
  policy: Scale,
};

function CardHeroBackground({ categorySlug }: { categorySlug: string }) {
  const category = getCategoryBySlug(categorySlug as never);
  const accent = category?.colorAccent ?? "#333";
  const bg = category?.colorBg ?? "#111";
  const label = category?.colorLabel ?? "#888";
  const Icon = CATEGORY_ICON[categorySlug] ?? Sparkles;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 60% 38%, ${accent}55 0%, ${bg} 70%)`,
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}45 0%, transparent 70%)`,
          filter: "blur(48px)",
        }}
      />
      {/* Large faint category mark — the branded "cover", fully in frame */}
      <div
        style={{
          position: "absolute",
          right: "22px",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.16,
          display: "flex",
        }}
      >
        <Icon size={132} strokeWidth={1.3} color={label} />
      </div>
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

function NewsCardInner({ item, onSave, isSaved = false }: NewsCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [copied, setCopied] = useState(false);
  const [sharePressed, setSharePressed] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
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
    const shareUrl = `https://kapyn.app/story/${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: shareUrl });
        posthog.capture("story_shared", {
          story_id: item.id,
          story_title: item.title,
          category: item.categorySlug,
          source_name: item.sourceName,
          share_method: "native",
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
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
    } catch (err) {
      // User cancelled the native share sheet — don't treat as an error
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Genuine error — fall back to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        posthog.capture("story_shared", {
          story_id: item.id,
          story_title: item.title,
          category: item.categorySlug,
          source_name: item.sourceName,
          share_method: "clipboard_fallback",
        });
      } catch {
        // Clipboard also unavailable — silently ignore
      }
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
      <div style={{ position: "relative", flex: "0 0 42%", overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
        {/* Branded gradient sits underneath as a placeholder so there's never a
            black flash while the hero image loads — the image fades in on top. */}
        <CardHeroBackground categorySlug={item.categorySlug} />
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
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

      {/* Content — padding-bottom leaves room for the footer below */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px 20px 60px",
          overflow: "hidden",
          minHeight: 0,
          background: `radial-gradient(ellipse at 50% -20%, ${category?.colorAccent ?? "transparent"}18, transparent 65%)`,
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
              fontSize: "11px",
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
            style={{ fontSize: "10px", color: "#8f8a82", fontWeight: 500 }}
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
            fontSize: "clamp(20px, 2.8dvh, 26px)",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "#E8E4DE",
            margin: 0,
            marginBottom: "8px",
            letterSpacing: "0",
            textDecoration: "none",
            display: "block",
            flexShrink: 0,
            transition: "opacity 0.15s ease",
          }}
        >
          {item.title}
        </a>

        {/* Summary — AI-generated, already sanitised at ingestion; no cleanText needed */}
        {(() => {
          const full = item.summary.trim();
          const titleWordCount = item.title.trim().split(/\s+/).length;
          const isShortTitle = titleWordCount <= 4;
          const firstDot = full.search(/\.\s+[A-Z]/);
          const lead = isShortTitle && firstDot > 0 && firstDot < 120 ? full.slice(0, firstDot + 1) : null;
          const body = lead ? full.slice(firstDot + 2) : full;
          return (
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
                  from: "summary",
                });
              }}
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                textDecoration: "none",
                color: "inherit",
                maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
              }}
            >
              {lead && (
                <p style={{
                  fontSize: "clamp(14px, 1.85dvh, 17px)",
                  lineHeight: 1.45,
                  color: "#D4D0CA",
                  fontWeight: 500,
                  margin: 0,
                  flexShrink: 0,
                }}>
                  {lead}
                </p>
              )}
              <p style={{
                fontSize: "clamp(13px, 1.7dvh, 16px)",
                lineHeight: 1.6,
                color: "#cbc7bf",
                fontWeight: 400,
                margin: 0,
                minHeight: 0,
                overflow: "hidden",
              }}>
                {body}
              </p>
            </a>
          );
        })()}

      </div>

      {/* Footer — direct child of card (position:relative), NOT inside overflow:hidden content div.
          This guarantees iOS WebKit always renders it at the card bottom. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 20px 12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          background: "linear-gradient(to top, rgba(10,10,10,1) 70%, rgba(10,10,10,0))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
          <span
            style={{
              fontSize: "10px",
              color: "#9a948b",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {item.sourceName}
          </span>
          <span style={{ fontSize: "9px", color: "#8f8a82", fontWeight: 500 }}>
            AI summary · {SUMMARY_MODEL}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBreakdown(true);
            posthog.capture("story_breakdown_opened", {
              story_id: item.id,
              story_title: item.title,
              category: item.categorySlug,
            });
          }}
          className="why-matters-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: category ? `${category.colorAccent}2e` : "rgba(255,255,255,0.10)",
            border: category
              ? `1px solid ${category.colorAccent}66`
              : "1px solid rgba(255,255,255,0.2)",
            borderRadius: "20px",
            padding: "6px 13px",
            fontSize: "13px",
            fontWeight: 600,
            color: category?.colorLabel ?? "#d4d4d4",
            cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          <Sparkles size={13} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          Why it matters
        </button>
      </div>

      <BreakdownSheet
        item={item}
        open={showBreakdown}
        onClose={() => setShowBreakdown(false)}
      />
    </div>
  );
}

// Memoized so a scroll-position change in CardStack doesn't re-render every card
// in the stack — only cards whose props actually change re-render.
export const NewsCard = memo(NewsCardInner);
