"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { CardStack } from "@/components/feed/CardStack";
import { getSavedStories } from "@/lib/storage";
import type { NewsItem } from "@/lib/types";
import posthog from "posthog-js";

export default function SavedPage() {
  const [savedStories, setSavedStories] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStories = () => {
    const stories = getSavedStories();
    setSavedStories(stories);
    setIsLoading(false);
    return stories;
  };

  useEffect(() => {
    const stories = loadStories();
    posthog.capture("saved_stories_viewed", {
      saved_count: stories.length,
    });
  }, []);

  const handleSaveChange = () => {
    loadStories();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--kt-canvas, #0a0a0a)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 20px 8px",
          flexShrink: 0,
        }}
      >
        <Bookmark size={20} color="var(--kt-text-primary, #f5f5f5)" strokeWidth={2} />
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--kt-text-primary, #f5f5f5)",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          Saved
        </h1>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kt-text-muted, #525252)" }}>
          <div className="refresh-spinner" />
        </div>
      ) : savedStories.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "var(--kt-text-muted, #a3a3a3)",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          {/* Glassmorphic Container for premium look */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "24px",
              padding: "32px 24px",
              maxWidth: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "var(--kt-read-surface-2, rgba(255, 255, 255, 0.05))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--kt-hairline, rgba(255, 255, 255, 0.1))",
              }}
            >
              <Bookmark size={28} className="animate-pulse" style={{ color: "rgba(255, 255, 255, 0.4)" }} />
            </div>
            <h2 style={{ fontSize: "18px", margin: 0, fontWeight: 700, color: "var(--kt-text-primary, #f5f5f5)", letterSpacing: "-0.02em" }}>
              Nothing saved yet
            </h2>
            <p style={{ fontSize: "14px", margin: 0, color: "var(--kt-text-muted, #737373)", lineHeight: 1.5 }}>
              Tap the bookmark on any story and it lands here, ready to pick up later.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--kt-text-primary, #f5f5f5)",
                border: "1px solid var(--kt-hairline, rgba(255,255,255,0.12))",
                borderRadius: "12px",
                padding: "10px 16px",
                textDecoration: "none",
              }}
            >
              Open the feed <ArrowRight size={15} strokeWidth={2.3} />
            </Link>
          </div>
        </div>
      ) : (
        <CardStack items={savedStories} onSave={handleSaveChange} />
      )}
    </div>
  );
}
